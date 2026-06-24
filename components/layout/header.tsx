import ProfileDropdown from '../shared/profile-dropdown';
import { SidebarTrigger } from '../ui/sidebar';

const Header = () => {
    return (
        <header className="dashboard-header flex h-13 shrink-0 items-center justify-between gap-2 border-b border-[#ECE0D4] bg-[#FFFDFA]/95 px-4 py-3 backdrop-blur-sm transition-[width,height] ease-linear sm:h-18 md:px-6 dark:border-neutral-800 dark:bg-neutral-900/95">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ms-1 size-[unset] cursor-pointer p-0 text-[#6E6A63] hover:text-[#2B2A28] dark:text-neutral-400 dark:hover:text-neutral-100" />
            </div>
            <div className="flex items-center gap-3">
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default Header;
