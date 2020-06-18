import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
import './styles.css';

interface Props{
    OnFileUploaded: (file: File) => void;
}
const Dropzone: React.FC<Props> = ({ OnFileUploaded }) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('');
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        const fileUrl = URL.createObjectURL(file);

        setSelectedFileUrl(fileUrl);
        OnFileUploaded(file);
    }, [OnFileUploaded])
    const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: 'image/*'
    })

    return (
    <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} accept='image/*'/>
        { selectedFileUrl
            ?<img src={selectedFileUrl} alt="Point thumbnail" />
            : (
                <p>
                    <FiUpload />
                    Imagem do medicamento
                </p> 
            )
        }        
    </div>
    )
}

export default Dropzone;