import CollectionPage from '@/Pages/CollectionPage';

interface Props {
    videos: any;
    query: string;
}

export default function MorningWorshipBroadcasting({ videos, query }: Props) {
    return (
        <CollectionPage
            title="Morning Worship Broadcasting"
            routeName="collections.morning-worship-broadcasting"
            videos={videos}
            query={query}
        />
    );
}
