import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).nullable(),
    email: vine.string().email().trim(),
    password: vine.string().minLength(6).confirmed(),
    cpf: vine.string().regex(/^\d{11}$/).nullable(),
    birthDate: vine.string().optional(), // Validação como string (ISO format)
    phone: vine.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/).nullable(),
    landline: vine.string().regex(/^\(\d{2}\) \d{4}-\d{4}$/).nullable(),
    gender: vine.enum(['Masculino', 'Feminino', 'Outro']).nullable(),
  })
)
