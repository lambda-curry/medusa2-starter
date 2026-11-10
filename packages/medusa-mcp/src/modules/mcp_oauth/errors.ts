/** An error an OAuth endpoint reports as `{ error, error_description }`. */
export class OAuthError extends Error {
  constructor(
    readonly code:
      | 'invalid_request'
      | 'invalid_client'
      | 'invalid_grant'
      | 'invalid_scope'
      | 'invalid_target'
      | 'invalid_redirect_uri'
      | 'invalid_client_metadata'
      | 'unsupported_grant_type'
      | 'unsupported_response_type'
      | 'access_denied'
      | 'server_error',
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = 'OAuthError';
  }

  toJSON() {
    return { error: this.code, error_description: this.message };
  }
}

/** An authorization error raised after the redirect URI is verified, so it goes back to the client by redirect. */
export class RedirectableOAuthError extends OAuthError {
  constructor(
    code: OAuthError['code'],
    message: string,
    readonly redirectUri: string,
    readonly state?: string,
  ) {
    super(code, message);
    this.name = 'RedirectableOAuthError';
  }
}
