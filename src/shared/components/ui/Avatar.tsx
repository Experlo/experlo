'use client';

interface AvatarProps {
  name: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
];

const sizeClasses = {
  small: 'text-sm',
  medium: 'text-xl',
  large: 'text-3xl',
};

export default function Avatar({ name, className = '', size = 'medium' }: AvatarProps) {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent color based on the name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div className={`absolute inset-0 ${bgColor} flex items-center justify-center`}>
        <span className={`text-white font-semibold ${sizeClasses[size]}`}>{initials}</span>
      </div>
    </div>
  );
}
