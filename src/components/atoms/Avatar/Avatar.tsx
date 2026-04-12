interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white/40 ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full
        bg-gradient-to-br from-blush to-lavender
        flex items-center justify-center
        font-medium text-text-primary ring-2 ring-white/40
        ${className}
      `}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
