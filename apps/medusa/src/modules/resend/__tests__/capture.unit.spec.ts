import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Resend } from 'resend';
import Service from '../service';

jest.mock('resend', () => ({ Resend: jest.fn() }));

describe('preview email capture', () => {
  const logger = { error: jest.fn() } as any;
  const originalMode = process.env.PREVIEW_MODE;
  afterEach(() => {
    if (originalMode === undefined) delete process.env.PREVIEW_MODE;
    else process.env.PREVIEW_MODE = originalMode;
    jest.clearAllMocks();
  });
  it('requires explicit preview mode and preserves production key validation', () => {
    delete process.env.PREVIEW_MODE;
    expect(() => Service.validateOptions({ capture_dir: '/tmp/capture', from: 'test' })).toThrow('PREVIEW_MODE');
    expect(() => Service.validateOptions({ from: 'test' })).toThrow('api_key');
  });
  it('captures rendered HTML without creating a Resend client', async () => {
    process.env.PREVIEW_MODE = 'true';
    const directory = await mkdtemp(join(tmpdir(), 'chef-email-test-'));
    try {
      const options = { capture_dir: directory, api_key: '', from: 'chef@example.invalid',
        html_templates: { receipt: { subject: 'Preview receipt', content: '<p>Receipt</p>' } } };
      Service.validateOptions(options);
      const service = new Service({ logger }, options);
      const result = await service.send({ template: 'receipt', to: 'guest@example.invalid', data: {} } as any);
      const files = await readdir(directory);
      expect(files).toEqual([`${result.id}.json`]);
      expect(JSON.parse(await readFile(join(directory, files[0]), 'utf8'))).toMatchObject({
        html: '<p>Receipt</p>', to: ['guest@example.invalid'], subject: 'Preview receipt',
      });
      expect(Resend).not.toHaveBeenCalled();
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
});
