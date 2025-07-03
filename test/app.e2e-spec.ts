import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('End-to-End Voting Flow', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let materiaId: number;
  let alternativa1Id: number;
  let alternativa2Id: number;
  let alternativa3Id: number;

  // Se ejecuta UNA SOLA VEZ antes de todos los tests en este describe()
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Limpiamos y poblamos la BD al inicio
    await dataSource.query(
      'TRUNCATE TABLE "user", "evento", "materia", "alternativa", "votacion" RESTART IDENTITY CASCADE;',
    );
    await request(app.getHttpServer()).get('/seeder/seed');
  });

  afterAll(async () => {
    await app.close();
  });

  it('STEP 1: User should login and retrieve voting data', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'accionista1@test.com', password: 'password123' })
      .expect(201);

    accessToken = loginResponse.body.access_token;
    expect(accessToken).toBeDefined();

    const eventoResponse = await request(app.getHttpServer())
      .get('/eventos/activo')
      .set('Authorization', `Bearer ${accessToken}`);
    const eventoId = eventoResponse.body.codEve;

    const materiasResponse = await request(app.getHttpServer())
      .get(`/eventos/${eventoId}/materias`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(materiasResponse.body.materias).toHaveLength(2);
    expect(materiasResponse.body.usuarioAcciones).toBe(15000);

    materiaId = materiasResponse.body.materias[0].codMat;
    alternativa1Id = materiasResponse.body.materias[0].alternativas[0].codAlt;
    alternativa2Id = materiasResponse.body.materias[0].alternativas[1].codAlt;
    alternativa3Id = materiasResponse.body.materias[0].alternativas[2].codAlt;
  });

  it('STEP 2: User should cast their vote', () => {
    return request(app.getHttpServer())
      .post('/eventos/votar')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        materiaId: materiaId,
        votos: [
          { alternativaId: alternativa1Id, cantidadAcciones: 10000 },
          { alternativaId: alternativa2Id, cantidadAcciones: 5000 },
        ],
      })
      .expect(201)
      .then((response) => {
        expect(response.body.message).toBe('Voto registrado exitosamente');
      });
  });

  it('STEP 3: The results should reflect the vote cast', async () => {
    const response = await request(app.getHttpServer())
      .get(`/eventos/materias/${materiaId}/resultados`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveLength(2); // <-- Ahora sí debería funcionar
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          totalVotos: 10000,
          alternativaId: alternativa1Id,
        }),
        expect.objectContaining({
          totalVotos: 5000,
          alternativaId: alternativa2Id,
        }),
      ]),
    );
  });

  it('STEP 4: User should be able to change their vote (re-vote)', async () => {
    await request(app.getHttpServer())
      .post('/eventos/votar')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        materiaId: materiaId,
        votos: [{ alternativaId: alternativa3Id, cantidadAcciones: 15000 }],
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/eventos/materias/${materiaId}/resultados`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      alternativaId: alternativa3Id,
      totalVotos: 15000,
    });
  });
});
