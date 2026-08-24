"use client";

import type { ServiceDto, StaffDto } from "@/lib/booking-types";
import { Avatar, Eyebrow, StepLead, StepTitle } from "./ui";

export function StaffStep({
  service,
  staff,
  selectedId,
  onSelect,
}: {
  service: ServiceDto;
  staff: StaffDto[];
  /** `null` means "peu importe"; `undefined` means nothing picked yet. */
  selectedId: string | null | undefined;
  onSelect: (staffId: string | null) => void;
}) {
  const eligible = staff.filter((member) => service.staffIds.includes(member.id));

  return (
    <div>
      <Eyebrow>Étape 2</Eyebrow>
      <StepTitle>Qui souhaitez-vous pour votre rendez-vous ?</StepTitle>
      <StepLead>
        Choisissez une professionnelle, ou laissez-nous vous attribuer la première disponible.
      </StepLead>

      <ul className="mt-8 space-y-3">
        <li className="pop-in">
          <button
            type="button"
            onClick={() => onSelect(null)}
            data-selected={selectedId === null}
            className={`pick-card flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left sm:px-5 ${
              selectedId === null
                ? "border-terracotta bg-blush/40"
                : "border-line bg-white/55 hover:border-terracotta/50 hover:bg-blush/25"
            }`}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-dashed border-terracotta/45 text-terracotta">
              <SparkIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-ink">Peu importe</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">
                Nous vous proposons les créneaux de toute l&apos;équipe et attribuons la
                professionnelle disponible.
              </span>
            </span>
          </button>
        </li>

        {eligible.map((member, index) => {
          const selected = member.id === selectedId;
          return (
            <li
              key={member.id}
              className="pop-in"
              style={{ "--delay": `${(index + 1) * 45}ms` } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => onSelect(member.id)}
                data-selected={selected}
                className={`pick-card flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left sm:px-5 ${
                  selected
                    ? "border-terracotta bg-blush/40"
                    : "border-line bg-white/55 hover:border-terracotta/50 hover:bg-blush/25"
                }`}
              >
                <Avatar
                  name={member.name}
                  initials={member.initials}
                  photo={member.photo}
                  color={member.color}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-ink">{member.name}</span>
                  {member.role ? (
                    <span className="mt-0.5 block text-[11px] tracking-[0.14em] text-rose uppercase">
                      {member.role}
                    </span>
                  ) : null}
                  {member.bio ? (
                    <span className="mt-1.5 block text-[13px] leading-relaxed text-ink-soft">
                      {member.bio}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9L12 17.1l-1.9-4.9-4.9-1.9 4.9-1.9L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" fill="currentColor" />
    </svg>
  );
}
