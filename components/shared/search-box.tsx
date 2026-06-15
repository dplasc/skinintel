import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandList,
} from "@/components/ui/command";
  

const SearchBox = () => {
    return (
        <Dialog>
            <DialogTrigger>
                <div className="relative sm:max-w-[388px] w-full cursor-pointer">
                    <Input 
                        className={cn("bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 shadow-none focus-visible:ring-0 focus-visible:border-primary border border-slate-300 h-10 pe-6 ps-11 w-full cursor-pointer disabled:opacity-[1] dark:border-slate-600 sm:block hidden")} 
                        placeholder="Search..." 
                        disabled
                    />
                    <span className="sm:absolute sm:top-[50%] sm:start-0 sm:ms-4 sm:-translate-y-[50%]">
                        <Search className='text-neutral-500 dark:text-white' width={18} height={18} />
                    </span>
                </div>
            </DialogTrigger>

            <DialogContent className={cn('p-0 !max-w-[620px] overflow-hidden')}>
                <DialogTitle className='hidden'>Search...</DialogTitle>
                <Command>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList className='scrollbar-thin scrollbar-invisible hover:scrollbar-visible max-h-[400px]'>
                        <CommandEmpty>No quick links available.</CommandEmpty>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
};

export default SearchBox;