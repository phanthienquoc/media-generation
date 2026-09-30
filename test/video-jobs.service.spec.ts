import { ConflictException, NotFoundException } from '@nestjs/common';
import { VideoJobsService } from '../src/video-jobs.service';

describe('VideoJobsService.retry', () => {
  const maybeSingle = jest.fn();
  const selectAfterUpdate = jest.fn(() => ({ maybeSingle }));
  const eqStatus = jest.fn(() => ({ select: selectAfterUpdate }));
  const eqId = jest.fn(() => ({ eq: eqStatus }));
  const update = jest.fn(() => ({ eq: eqId }));
  const lookupMaybeSingle = jest.fn();
  const lookupEq = jest.fn(() => ({ maybeSingle: lookupMaybeSingle }));
  const lookupSelect = jest.fn(() => ({ eq: lookupEq }));
  const from = jest.fn((table: string) => table === 'video_generation_jobs'
    ? { update, select: lookupSelect }
    : undefined);
  const client = { from };
  const service = new VideoJobsService({ client } as any);

  beforeEach(() => {
    jest.clearAllMocks();
    (service as any).get = jest.fn().mockResolvedValue({ id: 'job-1', status: 'QUEUED' });
  });

  it('requeues only a failed job and resets attempts', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 'job-1' }, error: null });

    await expect(service.retry('job-1')).resolves.toEqual({ id: 'job-1', status: 'QUEUED' });

    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'QUEUED',
      attempt_count: 0,
      provider_operation: null,
    }));
    expect(eqId).toHaveBeenCalledWith('job-1');
    expect(eqStatus).toHaveBeenCalledWith('FAILED');
  });

  it('rejects a non-failed existing job', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    lookupMaybeSingle.mockResolvedValueOnce({ data: { id: 'job-1', status: 'READY' }, error: null });

    await expect(service.retry('job-1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns not found for an unknown job', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    lookupMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    await expect(service.retry('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
