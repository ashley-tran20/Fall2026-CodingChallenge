import { useSearchParams } from "react-router";
import "./searchPage.css";
import Gallery from "../../components/gallery/gallery";

const SearchPage = () => {
    //finds a function with the pair called search and the word that follows searc
    //is the keyword that you want to use 
    //the || is just in case there are no parameters that were entered in hte search bar
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search") || "";

  return (
    //this search value gets passed into gallery 
    <div className="searchpage">
        {/* then gallery will use the inital querey to search the gallery for similar images instead of the default pixaby images  */}
      <Gallery initialQuery={query} />
    </div>
  );
};

export default SearchPage;
