// Repositorio HTB: getProfile lanza HtbProfileDataError (feature 22); getProfileOrNull devuelve null (feature 27).
import type { HtbProfile } from '../entities/htb-profile.ts';

const HTB_API_URL = 'https://labs.hackthebox.com/api/v4/user/profile/basic';

export class HtbProfileDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HtbProfileDataError';
  }
}
export class HtbProfileRepository {
  private readonly token: string | undefined;
  private readonly userId: string | undefined;

  constructor(token: string | undefined, userId: string | undefined) {
    this.token = token;
    this.userId = userId;
  }

  async getProfile(): Promise<HtbProfile> {
    this.assertCredentials();
    const response = await this.requestProfile();
    return parseHtbProfile(await this.readJson(response));
  }

  // Vía degradada (REQ-27-01..06): cualquier modo de fallo resuelve a null.
  async getProfileOrNull(): Promise<HtbProfile | null> {
    try {
      return await this.getProfile();
    } catch {
      return null;
    }
  }

  private assertCredentials(): void {
    if (!this.token || !this.userId) {
      throw new HtbProfileDataError('HTB API: faltan el token o el identificador (env sin definir)');
    }
  }

  private async requestProfile(): Promise<Response> {
    try {
      return await fetch(`${HTB_API_URL}/${this.userId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
          'User-Agent': 'moibaldenegro.com',
        },
      });
    } catch {
      throw new HtbProfileDataError('HTB API: no se pudo contactar con la API');
    }
  }

  private async readJson(response: Response): Promise<unknown> {
    if (!response.ok) {
      throw new HtbProfileDataError(`HTB API: la API respondió con estado ${response.status}`);
    }
    try {
      return await response.json();
    } catch {
      throw new HtbProfileDataError('HTB API: la respuesta no es un JSON válido');
    }
  }
}

function parseHtbProfile(data: unknown): HtbProfile {
  const profile = asProfile(data);
  return {
    name: text(profile, 'full_name') ?? text(profile, 'name'),
    rank: text(profile, 'rank'),
    points: number(profile, 'points'),
    userOwns: number(profile, 'user_owns'),
    systemOwns: number(profile, 'system_owns'),
    countryName: text(profile, 'country_name'),
    joinedDate: text(profile, 'joined_date'),
  };
}

function asProfile(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || !('profile' in data)) {
    throw new HtbProfileDataError('HTB API: la respuesta no trae un perfil válido');
  }
  const profile = (data as Record<string, unknown>).profile;
  if (typeof profile !== 'object' || profile === null || Array.isArray(profile)) {
    throw new HtbProfileDataError('HTB API: la respuesta no trae un perfil válido');
  }
  return profile as Record<string, unknown>;
}

function text(profile: Record<string, unknown>, field: string): string | null {
  return typeof profile[field] === 'string' ? (profile[field] as string) : null;
}

function number(profile: Record<string, unknown>, field: string): number | null {
  return typeof profile[field] === 'number' ? (profile[field] as number) : null;
}