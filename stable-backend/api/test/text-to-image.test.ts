import { Server } from 'http';
import request from 'supertest';
import { describe, expect, beforeAll, beforeEach, afterAll, afterEach, it } from '@jest/globals';
import { initializeApi } from '../util/initialize-api';
import * as sinon from 'sinon';
import { redisPublisher } from '../services/redis-publisher';

const validPayload = {
  username: 'test',
  args: {
    prompt: 'An image of a corgi',
    height: 512,
    width: 512,
    steps: 30,
    seed: 12345,
  },
};

const endpoint = '/generators/text-to-image';

describe('/generators/text-to-image', () => {
  let server: Server;
  const sandbox = sinon.createSandbox();
  let publishStub: sinon.SinonStub;

  beforeAll(async () => {
    server = await initializeApi(true);
  });

  afterAll(async () => {
    server.close();
  });

  beforeEach(async () => {
    publishStub = sandbox.stub(redisPublisher, 'publish');
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it('should send a task to Redis and respond with a success on valid payload', async () => {
    request(server).post(endpoint).send(validPayload).expect(200);
    expect(publishStub.calledOnce);
  });

  it('should send a task to Redis and respond with a success on valid payload without seed', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, seed: undefined } })
      .expect(200);
    expect(publishStub.calledOnce);
  });

  it('should send a task to Redis and respond with a success on valid payload with prompt as an empty string', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, prompt: '' } })
      .expect(200);
    expect(publishStub.calledOnce);
  });

  it('should fail to process payload with missing username', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, username: undefined })
      .expect(400);
    expect(publishStub.notCalled);
  });

  it('should fail to process payload with missing steps', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, steps: undefined } })
      .expect(400);
    expect(publishStub.notCalled);
  });

  it('should fail to process payload with missing steps', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, steps: undefined } })
      .expect(400);
    expect(publishStub.notCalled);
  });

  it('should fail to process payload with missing prompt', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, prompt: undefined } })
      .expect(400);
    expect(publishStub.notCalled);
  });

  it('should fail to process payload with height not in the [128, 768] interval', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, height: 127 } })
      .expect(400);
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, width: 769 } })
      .expect(400);
    expect(publishStub.notCalled);
  });

  it('should fail to process payload with width not in the [128, 768] interval', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, width: 127 } })
      .expect(400);
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, width: 769 } })
      .expect(400);
    expect(publishStub.notCalled);
  });
});
