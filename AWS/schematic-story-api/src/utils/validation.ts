export class Validator {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUsername(username: string): boolean {
    // Alphanumeric, underscore, hyphen, 3-20 chars
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/<[^>]*>/g, ''); // Remove HTML tags
  }

  static validateSchematicData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.length < 3 || data.title.length > 100) {
      errors.push('Title must be between 3 and 100 characters');
    }

    if (data.description && data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    if (data.tags && (!Array.isArray(data.tags) || data.tags.length > 10)) {
      errors.push('Tags must be an array with maximum 10 items');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}