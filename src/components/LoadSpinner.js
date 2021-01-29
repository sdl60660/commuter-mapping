
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'


const LoadSpinner = () => {
    return (
        <div className="load-spinner">
            <Loader
                className="load-spinner__spinner"
                type="Rings"
                color="#E0E0E0"
                height={175}
                width={175}
                />
            <div className="load-spinner__text">Loading Maps...</div>
        </div>
    )
}

export default LoadSpinner;
