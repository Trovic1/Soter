import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Verification inbox (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.claim.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists claims in inbox and allows approval', async () => {
    const claim = await prisma.claim.create({ data: { campaignId: 'c1', amount: 10, recipientRef: 'r1', status: 'requested' as any } });

    const res = await request(app.getHttpServer()).get('/api/v1/verification').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c: any) => c.id === claim.id)).toBe(true);

    const approveRes = await request(app.getHttpServer()).post(`/api/v1/verification/${claim.id}/approve`).send({ actorId: 'op1' }).expect(200);
    expect(approveRes.body.status).toBe('verified');

    const updated = await prisma.claim.findUnique({ where: { id: claim.id } });
    expect(updated?.status).toBe('verified');
  });
});
