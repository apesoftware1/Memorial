import { useQuery } from "@apollo/client";
import { GET_LISTING_CATEGORY } from "@/graphql/queries/getListingCategory";

export const useListingCategories = (options: { skip?: boolean } = {}) => {
    const { data, loading, error } = useQuery(GET_LISTING_CATEGORY, {
        skip: !!options.skip,
        variables: { page: 1, pageSize: 50 },
    });
    return { categories: data?.listingCategories || [], loading, error };
};
