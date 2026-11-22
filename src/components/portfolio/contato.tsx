"use client";

import { type FormEvent, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Loader2, Mail, MessageCircle, Send } from "lucide-react";
import type { ContatoContent, SocialPlatform } from "@/data/contato";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ContatoProps {
  content: ContatoContent;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

type FieldName = "name" | "email" | "message";

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<FieldName, string>>;

interface ContactApiResponse {
  ok?: boolean;
  error?: string;
}

const INITIAL_VALUES: FormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASS_NAME =
  "w-full rounded-[12px] border border-white/10 bg-background/80 px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:outline-none focus-visible:border-brand-bright focus-visible:ring-2 focus-visible:ring-brand-bright/30 aria-[invalid=true]:border-red-400/70";

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinktreeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M12 3v6" />
      <path d="M5 9h14" />
      <path d="m7.05 4.05 9.9 9.9" />
      <path d="m16.95 4.05-9.9 9.9" />
      <path d="M12 15v6" />
    </svg>
  );
}

function SocialPlatformIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case "github":
      return <GithubIcon />;
    case "linkedin":
      return <LinkedinIcon />;
    case "linktree":
      return <LinktreeIcon />;
    case "email":
      return <Mail className="size-5" strokeWidth={1.75} aria-hidden="true" />;
    case "instagram":
      return <InstagramIcon />;
    case "whatsapp":
      return (
        <MessageCircle
          className="size-5"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
  }
}

function renderClosingLine(line: string) {
  if (!line.endsWith("?")) {
    return line;
  }

  return (
    <>
      {line.slice(0, -1)}
      <span className="text-brand-bright">?</span>
    </>
  );
}

function validateField(
  field: FieldName,
  value: string,
  validation: ContatoContent["form"]["validation"],
): string | undefined {
  const trimmed = value.trim();

  switch (field) {
    case "name":
      if (trimmed.length < 2) {
        return validation.nameRequired;
      }
      return undefined;
    case "email":
      if (trimmed.length === 0) {
        return validation.emailRequired;
      }
      if (!EMAIL_REGEX.test(trimmed)) {
        return validation.emailInvalid;
      }
      return undefined;
    case "message":
      if (trimmed.length === 0) {
        return validation.messageRequired;
      }
      if (trimmed.length < 10) {
        return validation.messageMinLength;
      }
      return undefined;
  }
}

function validateForm(
  values: FormValues,
  validation: ContatoContent["form"]["validation"],
): FormErrors {
  const errors: FormErrors = {};

  const nameError = validateField("name", values.name, validation);
  if (nameError) errors.name = nameError;

  const emailError = validateField("email", values.email, validation);
  if (emailError) errors.email = emailError;

  const messageError = validateField("message", values.message, validation);
  if (messageError) errors.message = messageError;

  return errors;
}

/**
 * Seção final de Contato (`#contato`): composição assimétrica com título
 * monumental escalonado, formulário de mensagem Editorial-Tech e faixa de
 * ícones sociais com coreografia ScrollTrigger.
 */
export function Contato({ content }: ContatoProps) {
  const scope = useRef<HTMLElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function updateField(field: keyof FormValues, nextValue: string) {
    setValues((prev) => ({ ...prev, [field]: nextValue }));

    if (status === "error") {
      setStatus("idle");
      setServerError(null);
    }

    if (field === "name" || field === "email" || field === "message") {
      if (fieldErrors[field]) {
        const nextError = validateField(
          field,
          nextValue,
          content.form.validation,
        );
        setFieldErrors((prev) => ({
          ...prev,
          [field]: nextError,
        }));
      }
    }
  }

  function handleReset() {
    setValues(INITIAL_VALUES);
    setFieldErrors({});
    setServerError(null);
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const errors = validateForm(values, content.form.validation);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.name) {
        nameInputRef.current?.focus();
      } else if (errors.email) {
        emailInputRef.current?.focus();
      } else if (errors.message) {
        messageInputRef.current?.focus();
      }
      return;
    }

    setFieldErrors({});
    setServerError(null);
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        }),
      });

      let payload: ContactApiResponse | null = null;
      try {
        payload = (await response.json()) as ContactApiResponse;
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.ok) {
        const apiError =
          typeof payload?.error === "string" && payload.error.trim().length > 0
            ? payload.error
            : content.form.errorMessage;
        setServerError(apiError);
        setStatus("error");
        return;
      }

      setValues(INITIAL_VALUES);
      setStatus("success");
    } catch {
      setServerError(content.form.errorMessage);
      setStatus("error");
    }
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".contact-line-inner",
            ".contact-fade",
            ".contact-form-card",
            ".contact-social-item",
          ],
          {
            clearProps: "all",
          },
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".contact-line-inner", {
          yPercent: 110,
          duration: 1.0,
          stagger: 0.1,
          ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: "#contato-title",
            start: "top 86%",
            once: true,
          },
        });

        gsap.from(".contact-fade", {
          y: 22,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "expo.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: "#contato-title",
            start: "top 84%",
            once: true,
          },
        });

        gsap.from(".contact-form-card", {
          y: 24,
          autoAlpha: 0,
          duration: 0.85,
          ease: "expo.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: ".contact-form-card",
            start: "top 88%",
            once: true,
          },
        });

        gsap.from(".contact-social-item", {
          y: 16,
          autoAlpha: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: "expo.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: ".contact-socials",
            start: "top 92%",
            once: true,
          },
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope },
  );

  const isSubmitting = status === "submitting";

  return (
    <section
      ref={scope}
      id="contato"
      aria-labelledby="contato-title"
      className="relative w-full overflow-x-clip bg-background px-[clamp(20px,4vw,56px)] pt-24 pb-10 text-foreground md:pt-28 md:pb-12 lg:pt-32 lg:pb-14"
    >
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)] lg:items-end lg:gap-12 xl:gap-16">
        <div className="flex flex-col items-start">
          <p className="mb-6 font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {content.eyebrow}
          </p>

          <h2
            id="contato-title"
            aria-label={content.headlineLines.join(" ")}
            className="font-display font-medium text-[clamp(2.65rem,7.2vw,7.75rem)] leading-[0.9] tracking-[-0.04em] text-foreground"
          >
            <span
              aria-hidden="true"
              className="block overflow-hidden pt-[0.04em] pb-[0.08em]"
            >
              <span className="contact-line-inner block whitespace-nowrap pl-0 pr-[0.04em] will-change-transform">
                {content.headlineLines[0]}
              </span>
            </span>

            <span
              aria-hidden="true"
              className="block overflow-hidden pt-[0.04em] pb-[0.08em]"
            >
              <span className="contact-line-inner block whitespace-nowrap pl-[0.8em] pr-[0.04em] md:pl-[1.15em] will-change-transform">
                {content.headlineLines[1]}
              </span>
            </span>

            <span
              aria-hidden="true"
              className="block overflow-hidden pt-[0.04em] pb-[0.16em]"
            >
              <span className="contact-line-inner block whitespace-nowrap pl-[1.95em] pr-[0.04em] md:pl-[2.85em] lg:pl-[3.05em] will-change-transform">
                {renderClosingLine(content.headlineLines[2])}
              </span>
            </span>
          </h2>

          <p className="contact-fade mt-7 max-w-[44ch] font-sans text-[clamp(0.95rem,1.2vw,1.125rem)] leading-[1.6] tracking-normal text-muted-foreground">
            {content.lead}
          </p>
        </div>

        <div className="w-full">
          <div className="contact-form-card rounded-[24px] border border-white/10 bg-card p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-medium text-foreground">
                {content.form.heading}
              </h3>
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-bright">
                {content.form.badge}
              </span>
            </div>

            {status === "success" ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 flex flex-col items-start rounded-[16px] border border-white/10 bg-background/60 p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-full border border-brand-bright/30 bg-brand/20 text-brand-bright">
                  <Check className="size-5" aria-hidden="true" />
                </span>
                <h4 className="mt-4 font-display text-lg font-medium text-foreground">
                  {content.form.successTitle}
                </h4>
                <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
                  {content.form.successDescription}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-6 inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-brand-bright/50 hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
                >
                  {content.form.resetLabel}
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
                {status === "error" && serverError ? (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-[12px] border border-red-400/35 bg-red-500/10 px-4 py-3 font-sans text-xs leading-relaxed text-red-200 sm:text-sm"
                  >
                    {serverError}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block font-sans text-xs font-medium tracking-[0.02em] text-foreground/90"
                    >
                      {content.form.fields.nameLabel}
                    </label>
                    <input
                      ref={nameInputRef}
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={values.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder={content.form.fields.namePlaceholder}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={
                        fieldErrors.name ? "contact-name-error" : undefined
                      }
                      className={INPUT_CLASS_NAME}
                    />
                    {fieldErrors.name ? (
                      <p
                        id="contact-name-error"
                        role="alert"
                        className="mt-1.5 font-sans text-xs text-red-300"
                      >
                        {fieldErrors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block font-sans text-xs font-medium tracking-[0.02em] text-foreground/90"
                    >
                      {content.form.fields.emailLabel}
                    </label>
                    <input
                      ref={emailInputRef}
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={values.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder={content.form.fields.emailPlaceholder}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={
                        fieldErrors.email ? "contact-email-error" : undefined
                      }
                      className={INPUT_CLASS_NAME}
                    />
                    {fieldErrors.email ? (
                      <p
                        id="contact-email-error"
                        role="alert"
                        className="mt-1.5 font-sans text-xs text-red-300"
                      >
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-1.5 block font-sans text-xs font-medium tracking-[0.02em] text-foreground/90"
                  >
                    {content.form.fields.subjectLabel}
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={values.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    placeholder={content.form.fields.subjectPlaceholder}
                    className={INPUT_CLASS_NAME}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block font-sans text-xs font-medium tracking-[0.02em] text-foreground/90"
                  >
                    {content.form.fields.messageLabel}
                  </label>
                  <textarea
                    ref={messageInputRef}
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    value={values.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder={content.form.fields.messagePlaceholder}
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={
                      fieldErrors.message ? "contact-message-error" : undefined
                    }
                    className={`${INPUT_CLASS_NAME} resize-y`}
                  />
                  {fieldErrors.message ? (
                    <p
                      id="contact-message-error"
                      role="alert"
                      className="mt-1.5 font-sans text-xs text-red-300"
                    >
                      {fieldErrors.message}
                    </p>
                  ) : null}
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="inline-flex min-h-[46px] w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-foreground transition-[filter,transform] duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          className="size-4 animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                        <span>{content.form.submittingLabel}</span>
                      </>
                    ) : (
                      <>
                        <span>{content.form.submitLabel}</span>
                        <Send className="size-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="contact-socials mt-6 flex flex-wrap items-center justify-between gap-4 px-1">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {content.socialsHeading}
            </span>

            <ul
              className="flex flex-wrap items-center gap-2.5"
              aria-label={content.socialsHeading}
            >
              {content.socials.map((item) => (
                <li key={item.id} className="contact-social-item">
                  <a
                    href={item.href}
                    aria-label={`${item.label}: ${item.handle}`}
                    title={`${item.label} — ${item.handle}`}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="flex size-11 items-center justify-center rounded-[12px] border border-white/10 bg-card text-foreground/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-bright/50 hover:text-brand-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <SocialPlatformIcon platform={item.platform} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
