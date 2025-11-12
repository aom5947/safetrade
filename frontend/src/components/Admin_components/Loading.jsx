import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Loading = ({ size = 'default', className }) => {
    const sizes = {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <Loader2 className={cn('animate-spin text-primary-600', sizes[size])} />
        </div>
    );
};

const LoadingPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">กำลังโหลด...</p>
            </div>
        </div>
    );
};

export { Loading, LoadingPage };
