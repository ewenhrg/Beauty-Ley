type IconProps = {
  className?: string;
};

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M14.2 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.3 1.4-1.3H17V5.1c-.2 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.4H9v2.8h2.4V21h2.8Z" />
    </svg>
  );
}

export function SnapchatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 3.2c2.6 0 4.6 1.9 4.6 4.7v.4c.7.3 1.1.8 1.1 1.3 0 .6-.6 1-1.3 1.2.1.4.3.8.6 1.1.7.7 1.7 1.1 2.8 1.2.2 0 .4.2.4.5s-.3.5-.6.6c-.3.1-.6.3-.6.6 0 .8 1.3 1.5 2.1 1.8.3.1.4.4.3.7-.1.2-.4.4-.7.4-.2 0-.5 0-.8-.1-.7-.2-1.4-.3-1.7 0-.4.4-.3 1.2-.8 1.7-.6.6-1.6.6-2.4.7-1 .1-1.6.5-2.3 1-.5.4-1.1.6-1.7.6s-1.2-.2-1.7-.6c-.7-.5-1.3-.9-2.3-1-.8-.1-1.8-.1-2.4-.7-.5-.5-.4-1.3-.8-1.7-.3-.3-1-.2-1.7 0-.3.1-.6.1-.8.1-.3 0-.6-.2-.7-.4-.1-.3 0-.6.3-.7.8-.3 2.1-1 2.1-1.8 0-.3-.3-.5-.6-.6-.3-.1-.6-.3-.6-.6s.2-.5.4-.5c1.1-.1 2.1-.5 2.8-1.2.3-.3.5-.7.6-1.1-.7-.2-1.3-.6-1.3-1.2 0-.5.4-1 1.1-1.3v-.4c0-2.8 2-4.7 4.6-4.7Z" />
    </svg>
  );
}
