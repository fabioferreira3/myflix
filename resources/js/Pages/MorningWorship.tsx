import CollectionPage from '@/Pages/CollectionPage';

interface Props {
    videos: any;
    query: string;
}

export default function MorningWorship({ videos, query }: Props) {
    return (
        <CollectionPage
            title="Morning Worship - Brazil"
            routeName="collections.morning-worship"
            videos={videos}
            query={query}
        />
    );
}
