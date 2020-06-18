import React, {useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './style.css';
import logo from '../../assets/Logo-DrugTrackingMack-svg350.svg';
import { Link, useHistory} from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Backdrop from '@material-ui/core/Backdrop';
import { makeStyles } from '@material-ui/core/styles';
import './style.css';
import Dropzone from '../../components/Dropzone';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse{
    sigla:string;
}

interface IBGECityResponse{
    nome:string;
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column'
    },
}));

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    
    const [ufs,setUFs] = useState<string[]>([]);
    const [cities, setCitiies] = useState<string[]>([]);
    const [selectedUf, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
    const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);
    const [selectedFile, setSelectedFile] = useState<File>();
    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp:'',
    })
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const history  = useHistory();
    
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude,longitude]); 
        })
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });     
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);

            setUFs(ufInitials);
        });
    }, [])
    
    useEffect(() =>{
        if(selectedUf === '0'){
            return;
        }
        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);

                setCitiies(cityNames);
        });
    },[selectedUf]);
    
    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUF(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handelMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value})
    }
    function handleSelectItem(id:number){

        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([ ...selectedItems, id]);
        }     
    }

    async function handleSubmit(event:FormEvent){
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();
     
        data.append('name',name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        
        if(selectedFile){
            data.append('image', selectedFile);
        }

        await api.post('points', data);
        
        handleSuccessOpen();
        setTimeout(() => history.push('/'), 3000);        
    }

    const classes = useStyles();
    const [ open, setOpen ] = useState(false);

    function handleSuccessOpen() {
        setOpen(true);
    }

    return (
        <div id="page-create-point">
            <header>
                <img src= {logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>            
            
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de rastreio do medicamento</h1>

                <Dropzone OnFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name = "name"
                            id="name"
                            placeholder="Informe o nome da entidade"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name = "email"
                                id="email"
                                placeholder="seuemail@seuemail.com.br"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">                        
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input
                                type="text"
                                name = "whatsapp"
                                id="whatsapp"
                                placeholder="(XX)XXXXX-XXXX"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom = {17} onClick={handelMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position = {selectedPosition} zoom = {17}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={handleSelectUf}
                             >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>                            
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city" 
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>                            
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item =>(
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className = {selectedItems.includes(item.id) ? 'selected' : '' }
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}                                                                    
                    </ul>
                </fieldset>

                <button type="submit">                
                    Cadastrar ponto de rastreio
                </button>
                <Backdrop className={ classes.backdrop } open={ open }>
                    <span>
                        <FiCheckCircle size="64" className="check-circle" />
                    </span>
                    <span className="success-message">Cadastro concluido!</span>
                </Backdrop>
            </form>
        </div>
    );
};

export default CreatePoint;
