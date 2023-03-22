import { Server } from 'http';
import { describe, expect, beforeAll, beforeEach, afterAll, afterEach, it } from '@jest/globals';
import request from 'supertest';
import { initializeApi } from '../util/initialize-api';
import * as sinon from 'sinon';
import { redisPublisher } from '../services/redis-publisher';

const image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAACAKADAAQAAAABAAACAAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgCAAIAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrC…KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9X+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr43+O3/BPf9iv9pnxlD8Q/jr8ONH8R65AgjF7cRskzouMCRo2TzAAMAPuwOBX2RRQBh+GfDHhzwXoFp4U8I2MGmaZYRLDbWtrGsUMUa9FRFACgegFblFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//W/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/Z"
const mask  = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAGwAbADAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT…8K/ZrC0vlZ9WMy/ZvKV871IOSSBwMZoQH6zaRZHTtNtbAymQ20KRbz1baAM/pQBcoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgBDzxQA3Z6GgBwGO9AC0AFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQB//Z"

const validPayload = {
  username: 'test',
  args: {
    prompt: 'An image of a corgi',
    image,
    mask,
    steps: 30,
    strength: 0.8,
    seed: 12345,
  },
};

const endpoint = '/generators/image-to-image';

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

  it('should fail to process payload with missing prompt', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, prompt: undefined } })
      .expect(400);
    expect(publishStub.notCalled);
  });

  it('should fail to process payload with a missing image', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, image: undefined } })
      .expect(400);
    expect(publishStub.notCalled);
  });

  it('should fail to process payload with a missing mask', async () => {
    request(server)
      .post(endpoint)
      .send({ ...validPayload, args: { ...validPayload.args, image: undefined } })
      .expect(400);
    expect(publishStub.notCalled);
  });
});
