type TauMarkProps = {
  className?: string;
};

export function TauMark({ className }: TauMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 12H53M32 12V54" stroke="currentColor" strokeWidth="7" />
    </svg>
  );
}
