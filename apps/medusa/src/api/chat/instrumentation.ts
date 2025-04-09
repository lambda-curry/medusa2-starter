import { LangfuseExporter } from 'langfuse-vercel';
import { loadEnv } from '@medusajs/framework/utils';

function validateEnvironment(): void {
  // Load environment variables using Medusa's utility
  loadEnv(process.env.NODE_ENV || 'development', process.cwd());

  const requiredVars = ['LANGFUSE_SECRET_KEY', 'LANGFUSE_PUBLIC_KEY', 'LANGFUSE_BASE_URL'] as const;

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables for Langfuse telemetry: ${missingVars.join(', ')}`);
  }

  // Log environment setup (without exposing secrets)
  console.log(`[Telemetry] Using Langfuse endpoint: ${process.env.LANGFUSE_BASE_URL}`);
}

export async function register(): Promise<void> {
  try {
    // Validate environment before proceeding
    validateEnvironment();

    const { registerOTel } = await import('@vercel/otel');

    registerOTel({
      serviceName: 'medusa-ai-chat',
      traceExporter: new LangfuseExporter({
        // Always sample in development, use sampling in production
        sampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
        baseUrl: process.env.LANGFUSE_BASE_URL,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      }),
    });

    console.log('[Telemetry] OpenTelemetry instrumentation registered successfully');
    console.log(`[Telemetry] Sampling rate: ${process.env.NODE_ENV === 'development' ? '100%' : '10%'}`);
  } catch (error) {
    console.error(
      '[Telemetry] Failed to register OpenTelemetry instrumentation:',
      error instanceof Error ? error.message : String(error),
    );
    throw error; // Re-throw to let the service handle it
  }
}
