"use client";

import { PAKISTAN_CITIES, type CustomerFormData } from "@/lib/checkout-delivery";

type CustomerDetailsFieldsProps = {
  formData: CustomerFormData;
  fieldErrors: Record<string, string>;
  onChange: (field: keyof CustomerFormData, value: string) => void;
  idPrefix?: string;
};

const fieldStyles = {
  label:
    "block font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.08em] text-cream-deep/70",
  input:
    "mt-1.5 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 font-[var(--font-dm-sans)] text-[13px] text-cream-soft placeholder:text-cream-deep/50 aria-invalid:border-red-400/80",
  textarea:
    "mt-1.5 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 font-[var(--font-dm-sans)] text-[13px] text-cream-soft placeholder:text-cream-deep/50 aria-invalid:border-red-400/80",
  error: "mt-1 font-[var(--font-dm-sans)] text-[12px] text-red-300",
} as const;

export function CustomerDetailsFields({
  formData,
  fieldErrors,
  onChange,
  idPrefix = "",
}: CustomerDetailsFieldsProps) {
  const styles = fieldStyles;
  const id = (name: string) => `${idPrefix}${name}`;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label htmlFor={id("name")} className={styles.label}>
            Full name *
          </label>
          <input
            id={id("name")}
            name="name"
            required
            autoComplete="name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? id("name-error") : undefined}
            className={styles.input}
          />
          {fieldErrors.name && (
            <p id={id("name-error")} className={styles.error} role="alert">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={id("phone")} className={styles.label}>
            Phone *
          </label>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder="03XX XXXXXXX"
            value={formData.phone}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^\d+\s()-]/g, "");
              onChange("phone", cleaned);
            }}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? id("phone-error") : undefined}
            className={styles.input}
          />
          {fieldErrors.phone && (
            <p id={id("phone-error")} className={styles.error} role="alert">
              {fieldErrors.phone}
            </p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor={id("city")} className={styles.label}>
          City *
        </label>
        <input
          id={id("city")}
          name="city"
          required
          autoComplete="address-level2"
          list={id("city-suggestions")}
          value={formData.city}
          onChange={(e) => onChange("city", e.target.value)}
          aria-invalid={Boolean(fieldErrors.city)}
          aria-describedby={fieldErrors.city ? id("city-error") : undefined}
          className={styles.input}
        />
        <datalist id={id("city-suggestions")}>
          {PAKISTAN_CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
        {fieldErrors.city && (
          <p id={id("city-error")} className={styles.error} role="alert">
            {fieldErrors.city}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={id("address")} className={styles.label}>
          Full address *
        </label>
        <textarea
          id={id("address")}
          name="address"
          required
          rows={3}
          autoComplete="street-address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          aria-invalid={Boolean(fieldErrors.address)}
          aria-describedby={fieldErrors.address ? id("address-error") : undefined}
          className={styles.textarea}
        />
        {fieldErrors.address && (
          <p id={id("address-error")} className={styles.error} role="alert">
            {fieldErrors.address}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={id("notes")} className={styles.label}>
          Notes (optional)
        </label>
        <textarea
          id={id("notes")}
          name="notes"
          rows={2}
          value={formData.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          className={styles.textarea}
        />
      </div>
    </div>
  );
}
