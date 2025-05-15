'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/core/utils';
import { buttonVariants } from '@/shared/components/ui/Button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames = {},
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        // month panels
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',

        // header area
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',

        // flatten the table structure into a CSS grid
        table: 'w-full border-collapse grid grid-cols-7',
        thead: 'contents',
        tbody: 'contents',

        // weekday headers all live in the 7-col grid
        head_row: 'contents',
        head_cell:
          'text-muted-foreground font-medium text-[0.8rem] text-center py-1',

        // each week row is also flattened
        row: 'contents',
        cell: cn(
          'relative text-center text-sm py-1 focus-within:z-20',
          // rounded corners on selected/range ends
          props.mode === 'range'
            ? '[&:has([aria-selected])]:rounded-none'
            : '[&:has([aria-selected])]:rounded-md',
          '[&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
        ),

        // the day “button” fills its entire grid cell
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'w-full h-full p-0 font-normal aria-selected:opacity-100'
        ),

        // states & variants
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',

        // allow consumer overrides
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
