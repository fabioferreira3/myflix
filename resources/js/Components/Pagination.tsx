import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null;

    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    return (
        <div className="flex w-full items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-700">
            {/* Previous */}
            {prev.url === null ? (
                <span
                    className="px-3 py-1 text-sm text-gray-400 dark:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: prev.label }}
                />
            ) : (
                <Link
                    href={prev.url}
                    className="rounded px-3 py-1 text-sm text-gray-600 transition hover:bg-neutral-800 hover:text-white dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: prev.label }}
                />
            )}

            {/* Page numbers */}
            <div className="flex flex-wrap items-center justify-center gap-1">
                {pages.map((link, index) => (
                    link.url === null ? (
                        <span
                            key={index}
                            className="px-3 py-1 text-sm text-gray-400 dark:text-gray-600"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            key={index}
                            href={link.url}
                            className={[
                                'rounded px-3 py-1 text-sm transition',
                                link.active
                                    ? 'bg-purple-700 font-semibold text-white'
                                    : 'text-gray-600 hover:bg-neutral-800 hover:text-white dark:text-gray-300',
                            ].join(' ')}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                ))}
            </div>

            {/* Next */}
            {next.url === null ? (
                <span
                    className="px-3 py-1 text-sm text-gray-400 dark:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: next.label }}
                />
            ) : (
                <Link
                    href={next.url}
                    className="rounded px-3 py-1 text-sm text-gray-600 transition hover:bg-neutral-800 hover:text-white dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: next.label }}
                />
            )}
        </div>
    );
}
