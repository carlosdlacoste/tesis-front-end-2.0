import React from "react";
import "./FileReader.css";
import "react-dropzone-uploader/dist/styles.css";

import Swal from "sweetalert2";

import { makeStyles } from "@material-ui/core/styles";
import { postArchitecture } from "../../api/architecture/architecture";
import Dropzone from "react-dropzone-uploader";
import Modal from "@material-ui/core/Modal";
import TextField from "@material-ui/core/TextField";

import Loader from "../Loader/Loader";


const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    top: "20%",
    left: "20%",
    width: "60%",
    minHeight: 300,
    maxHeight: 600,
    overflow: 'auto',
    border: "none",
    borderRadius: 5,
    background: "var(--background)",
    boxShadow: theme.shadows[5],
    padding: "32px 24px 20px",
  },
  h1: {
    color: "var(--primaryDark)",
    margin: "auto",
    marginBottom: 35,
    textAlign: "center",
    fontFamily: "var(font-family-content)",
  },
  validation: {
    color: "var(--error)",
    fontSize: 13,
    margin: 5
  }
}));

/** Componente que representa pop-up
 *  para añadir archivos
 */
function FileReader(props) {
  const classes = useStyles();
  const [name, setName] = React.useState("");
  const [valid, setValid] = React.useState(true);
  const [loader, setLoader] = React.useState(false);

  const handleChangeStatus = ({ meta }, status) => {
    //console.log(status, meta)
  };

  /**
   * Agrega el archivo al form-data y lo elimina del dropzone
   * @param {File} file archivo XML
   * @param {FormData} formData objeto form-data
   */
  const addFile = (file, formData) => {
    formData.append("file", file.file, file.meta.name);
    file.remove();
  };

  /**
   * Construir el form-data
   * @param {Array} allFiles arreglo que contiene todos los archivos XML
   */
  const getFormData = (allFiles) => {
    const formData = new FormData();
    formData.append('uid', props.uid);
    formData.append('name', name);
    formData.append('index', props.index);
    allFiles.forEach(file => {
      addFile(file, formData);
    })
    return formData;
  }

  /**
   * 
   * @param {Array} allFiles arreglo que contiene todos los archivos XML
   */
  const handleSubmit = async (allFiles) => {
    setLoader(true);
    if(name !== ""){
      const formData = getFormData(allFiles);
      var response = await postArchitecture(formData);
      if(response !== 'Error'){
        //Respuesta fallida
        swlError()
      }
      else{
        setName("")       
        swlSuccess()
        //Respuesta exitosa
      }
    }else{
      setValid(false);     
      
    }
  };


  /**
   * Actualizar el nombre según se actualice el TextField
   * @param {Event} event objeto de tipo evento
   */
  const handleChange = (event) => {
    setValid(true);
    setName(event.target.value);
  };

  /**
   * Popup temporal de SweetAlert con mensaje exitoso
   */
  function swlSuccess() {
    setTimeout(setLoader(false), 3000);
    props.onClose();
    Swal.fire({
        title: '¡Arquitectura creada!',
        icon: 'success',
        showConfirmButton: false,
        timer: 4000
      });
  }

    /**
   * Popup temporal de SweetAlert con mensaje de falla
   */
  function swlError() {
    setTimeout(setLoader(false), 3000);
    props.onClose();
    Swal.fire({
      icon: 'error',
      title: '¡Hubo un error!',
      text: 'La arquitectura no fue creada',
      showConfirmButton: false,
      timer: 5500
    })
  }

  return (
    <div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={props.open}
        onClose={props.onClose}
      >
        <div className={classes.paper}>
        {loader ? <Loader /> : 
        <>
          <h2 className={classes.h1}>Agregar {props.type}</h2>
          <TextField
            required
            id="outlined-basic"
            label="Nombre"
            value={name}
            onChange={handleChange}
            variant="outlined"
          />
          {!valid ? <div className={classes.validation}>* El nombre de la arquitectura es obligatorio </div> : null}
          <Dropzone
            onChangeStatus={handleChangeStatus}
            onSubmit={handleSubmit}
            styles={{ dropzone: { maxHeight: 200, maxWidth: 400 } }}
            accept="text/xml"
            inputContent={(files, extra) =>
              extra.reject
                ? "Solo cargar archivos .xml"
                : "Agrega archivos o hacer clic para buscar"
            }
            styles={{
              dropzoneReject: { borderColor: "red", backgroundColor: "#DAA" },
              inputLabel: (files, extra) =>
                extra.reject ? { color: "red" } : {},
            }}
          />
          </>}
        </div>
      </Modal>
    </div>
  );
}

export default FileReader;
