import { NextResponse } from "next/server";

interface ContactRequestBody {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ContactRequestBody;

  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json(
        { ok: false, error: "Payload inválido." },
        { status: 400 },
      );
    }
    body = parsed as ContactRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Corpo da requisição JSON inválido." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Informe seu nome (mínimo de 2 caracteres)." },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Informe um endereço de e-mail válido." },
      { status: 400 },
    );
  }

  if (message.length < 10) {
    return NextResponse.json(
      { ok: false, error: "A mensagem deve ter pelo menos 10 caracteres." },
      { status: 400 },
    );
  }

  // TODO: Em produção, conectar um provedor de e-mail via variáveis de ambiente
  // (ex.: Resend com RESEND_API_KEY ou Nodemailer com SMTP_HOST/SMTP_USER/SMTP_PASS)
  // utilizando { name, email, subject, message }.
  void subject;

  return NextResponse.json({ ok: true }, { status: 200 });
}
