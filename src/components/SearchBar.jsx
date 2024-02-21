import { useState, useEffect } from "react";
import { getCitySuggestions } from "../data/cityData";
import '../style/SearchBar.css'

const debouncer = (fn, delay)=>{
    let timerId = null;

    return function (...restArgs) {
        if (timerId) {
            // clear existing timer
            clearTimeout(timerId);
            console.log('cancelled #'+timerId);
        }                
    
        // shedule function call
        timerId = setTimeout(()=>{
            console.log('executing #'+timerId);
            fn(...restArgs);
            timerId = null;

        }, delay );
        console.log('scheduled #'+timerId);
    }
}

/* we need to debounce searching cities on input, by some milliseconds
to do that, we need to debounce the respective stateSetter method, which has to be done inside the component
but we don't want the execute the creation of the debounced function every time the component rerenders
to prevent this, we can implement useEffect to create the debounced search function the first time
but if we declare this function inside the component, we'll have to assign it some definition on every rerender
otherwise it will become undefined
so declare this function outside the component
*/
let updateCities;

export default function SearchBar() {

    const [cities, setCities] = useState();

    // only controlling the input element to apply selected suggested search
    const [inputValue, setInputValue] = useState('');

    // controlling the suggestionContainer to hide/show on focus/blur
    const [showSuggestions, setShowSuggestions] = useState(true)

    useEffect(()=>{
        updateCities = debouncer((query)=>{
            // don't search the data, in case of empty query
            if (query) {
                setCities(getCitySuggestions(query));
            }
            else {
                setCities();
            }

        }, 300);
    }, []);

    
    function changeHandler(e) {
        const value = e.target.value;
        
        setInputValue(value);
        
        updateCities(value);
        
    }

    function applySelectedCity(value) {
        // change the input value to the selected city
        // and hide the suggestions 
        setInputValue(value);
        setShowSuggestions(false);
        
    }

    function focusHandler(e) {        
        updateCities(inputValue);
    }
    function blurHandler(e) {    
        // blurEvent handler executes before click handler
        // asynchronously hide the suggestions container so that 
        // the click event on the suggestion gets time to be executed
        setTimeout(() => {
            setCities();
        }, 200);
    }    

    return (
        <div className="search-cities-container">
            <div className="input-container">
                <input
                    value = {inputValue}
                    onChange={(e)=>changeHandler(e)} 
                    onFocus={(e)=>focusHandler(e)}
                    onBlur={e => blurHandler(e)}
                    type="text" 
                    placeholder="Search"
                />
            </div>


            {
                cities &&(
                    <div className={`suggested-results-container`} >
                        {
                            cities.map( city => {

                                return (
                                    <p 
                                        key={city}
                                        onClick={()=>{applySelectedCity(city)}}
                                        className="suggested-result">
                                            {city}
                                    </p>
                                )
                            })
                        }
                        
                    </div>
                )
            }
        
        </div>
    )
}