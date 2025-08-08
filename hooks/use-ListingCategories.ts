import { useQuery } from "@apollo/client";
import { GET_LISTING_CATEGORY } from "@/graphql/queries/getListingCategory";

export const useListingCategories = () => {
    const { data, loading, error } = useQuery(GET_LISTING_CATEGORY);
    return { categories: data?.listingCategories || [], loading, error };
};
