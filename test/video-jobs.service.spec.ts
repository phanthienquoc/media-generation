import { ConflictException, NotFoundException } from '@nestjs/common';
import { VideoJobsService } from '../src/video-jobs.service';

describe('VideoJobsService.retry', () => {
  const maybeSingle = jest.fn();
  const select = jest.fn(() => ({ maybeSingle }));
  const eq2 = jest.fn(() => ({ select }));
  const eq1 = jest.fn(() => ({ eq: eq2 }));
  const update = jest.fn(() => ({ eq: eq1 }));
  const client = { from: jest.fn(() => ({ update, select: jest.fn(() => ({ eq: jest.fn(() => ({ maybeSingle })) })) })) };
  const service = new VideoJobsService({ client } as any);

  beforeEach(() => { jest.clearAllMocks(); (service as any).get = jest.fn().mockResolvedValue({ id: 'job-1', status: 'QUEUED' }); });

  it('requeues only a failed job', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 'job-1' }, error: null });
    await expect(service.retry('job-1')).resolves.toEqual({ id: 'job-1', status: 'QUEUED' });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'QUEUED' }));
  });

  it('rejects a non-failed existing job', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({ data: { id: 'job-1', status: 'READY' }, error: null });
    await expect(service.retry('job-1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns not found for an unknown job', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({ data: null, error: null });
    await expect(service.retry('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
