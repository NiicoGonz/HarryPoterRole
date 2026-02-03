const inputValidator = require('../Utils/inputValidator');

describe('InputValidator', () => {
    describe('validateCharacterName', () => {
        test('debe aceptar nombres válidos', () => {
            const result = inputValidator.validateCharacterName('Harry Potter');
            expect(result.valid).toBe(true);
            expect(result.sanitized).toBe('Harry Potter');
        });

        test('debe rechazar nombres muy cortos', () => {
            const result = inputValidator.validateCharacterName('H');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('al menos 2 caracteres');
        });

        test('debe rechazar nombres muy largos', () => {
            const longName = 'A'.repeat(31);
            const result = inputValidator.validateCharacterName(longName);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('más de 30 caracteres');
        });

        test('debe rechazar caracteres especiales inválidos', () => {
            const result = inputValidator.validateCharacterName('Test@123');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('solo puede contener');
        });

        test('debe rechazar palabras prohibidas', () => {
            const result = inputValidator.validateCharacterName('admin');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('no permitidas');
        });

        test('debe limpiar espacios extra', () => {
            const result = inputValidator.validateCharacterName('  Harry   Potter  ');
            expect(result.valid).toBe(true);
            expect(result.sanitized).toBe('Harry Potter');
        });

        test('debe aceptar nombres con apóstrofes', () => {
            const result = inputValidator.validateCharacterName("O'Brien");
            expect(result.valid).toBe(true);
        });

        test('debe aceptar nombres con guiones', () => {
            const result = inputValidator.validateCharacterName('Jean-Paul');
            expect(result.valid).toBe(true);
        });
    });

    describe('validateNumber', () => {
        test('debe aceptar números válidos', () => {
            const result = inputValidator.validateNumber(5, 1, 10);
            expect(result.valid).toBe(true);
            expect(result.value).toBe(5);
        });

        test('debe rechazar valores menores al mínimo', () => {
            const result = inputValidator.validateNumber(0, 1, 10);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('mínimo');
        });

        test('debe rechazar valores mayores al máximo', () => {
            const result = inputValidator.validateNumber(11, 1, 10);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('máximo');
        });

        test('debe rechazar decimales', () => {
            const result = inputValidator.validateNumber(5.5, 1, 10);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('entero');
        });

        test('debe rechazar no-números', () => {
            const result = inputValidator.validateNumber('abc', 1, 10);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('número válido');
        });
    });

    describe('validateHouse', () => {
        test('debe aceptar casas válidas', () => {
            const houses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];
            houses.forEach(house => {
                const result = inputValidator.validateHouse(house);
                expect(result.valid).toBe(true);
                expect(result.sanitized).toBe(house);
            });
        });

        test('debe capitalizar correctamente', () => {
            const result = inputValidator.validateHouse('gryffindor');
            expect(result.valid).toBe(true);
            expect(result.sanitized).toBe('Gryffindor');
        });

        test('debe rechazar casas inválidas', () => {
            const result = inputValidator.validateHouse('Invalid');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('inválida');
        });
    });

    describe('validateDiscordId', () => {
        test('debe aceptar IDs válidos', () => {
            const result = inputValidator.validateDiscordId('123456789012345678');
            expect(result.valid).toBe(true);
        });

        test('debe rechazar IDs muy cortos', () => {
            const result = inputValidator.validateDiscordId('12345');
            expect(result.valid).toBe(false);
        });

        test('debe rechazar IDs no numéricos', () => {
            const result = inputValidator.validateDiscordId('abc123');
            expect(result.valid).toBe(false);
        });
    });

    describe('sanitizeText', () => {
        test('debe remover caracteres de control', () => {
            const result = inputValidator.sanitizeText('Test\x00\x1Fstring');
            expect(result).toBe('Teststring');
        });

        test('debe normalizar espacios', () => {
            const result = inputValidator.sanitizeText('Test    multiple   spaces');
            expect(result).toBe('Test multiple spaces');
        });

        test('debe limitar longitud', () => {
            const longText = 'A'.repeat(3000);
            const result = inputValidator.sanitizeText(longText, 100);
            expect(result.length).toBe(100);
        });

        test('debe manejar strings vacíos', () => {
            const result = inputValidator.sanitizeText('');
            expect(result).toBe('');
        });
    });
});
