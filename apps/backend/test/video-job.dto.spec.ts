import { validate } from 'class-validator';
import { VideoJobDto } from '../src/video-job.dto';

describe('VideoJobDto', () => {
  it('accepts a valid job', async () => {
    const dto = Object.assign(new VideoJobDto(), {
      prompt: 'Explain binary search visually.',
      model: 'veo-3.1-fast-generate-preview',
      aspectRatio: '16:9',
      resolution: '720p',
      attempts: 3
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects unsupported values', async () => {
    const dto = Object.assign(new VideoJobDto(), {
      prompt: 'test',
      model: 'unsupported-model',
      aspectRatio: '4:3',
      resolution: '8k',
      attempts: 9
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
