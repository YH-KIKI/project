import {useEffect, useState} from "react";
import './App.css';

function App() {
    const [str, setStr] = useState('');

    useEffect(() => {
	    const test = async () =>{
		    const response = await fetch('/api/test');

		    if(response.ok){
			    const result = await response.text();
			    setStr(result);
		    }
	    }
	    
	    test(str);
    }, []);
    return (
        <div className="App">
            백엔드 데이터
            < test/>
        </div>
    );
}

export default App;