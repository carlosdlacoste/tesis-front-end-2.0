import React, { useContext, useState, useEffect } from "react";
import "./Content.css";

import { makeStyles } from "@material-ui/core/styles";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import IconButton from "@material-ui/core/IconButton";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import Swal from "sweetalert2";

import AppContext from "../../auth/context/context";
import CytoscapeComponent from "react-cytoscapejs";
import Loader from "../Loader/Loader";
import nodesHelper from "../../helpers/nodes/nodes";

/**
 * Componente que representa el contenido
 * de la arquitectura seleccionada
 */
const Content = () => {
  const classes = useStyles();
  const [checked, setChecked] = React.useState(false);
  const [elementos, setElementos] = useState();
  const [load, setLoad] = useState(false);
  let cyto;
  const {
    selectedProject,
    setSelectedProject,
    cy,
    setCy,
    selectedNodes,
    setSelectedNodes,
    count,
    setCount
  } = useContext(AppContext);

  var edgeLabels = {
    on: {
      content: "data(id)",
    },
    off: {
      content: "",
    },
  };

  /** Creacion de capa de estilos para el grafo segun Cytoscape */
  var state = {
    layout: {
      name: "circle",
      fit: true,
      padding: 30,
      avoidOverlap: true,
      nodeDimensionsIncludeLabels: true,
      avoidOverlapPadding: 150,
    },
    stylesheet: [
      {
        selector: "node",
        style: {
          content: "data(id)",
          "font-size": 20,
          shape: "round-rectangle",
          "text-wrap": "wrap",
          "text-max-width": 80,
          "text-valign": "center",
          color: "#fff",
          "text-outline-color": "#18202C",
          width: 270,
          color: "white",
          height: 40,
          "background-color": "#18202C",
        },
      },
      {
        selector: "edge",
        style: {
          width: 4,
          "font-size": 20,
          "curve-style": "bezier",
          "edge-text-rotation": "autorotate",
          "target-arrow-shape": "triangle-tee",
          "text-valign": "top",
          "text-halign": "center",
          color: "#fff",
          "text-outline-color": "#18202C",
          "text-outline-width": 3,
          "line-color": "#18202C",
          "target-arrow-color": "#18202C",
        },
      },
    ],
  };

  const toggleChecked = () => {
    setChecked(prev => !prev);
  };

  const setEdgesLabel = () => {  
    
    if (!checked) {
      console.log("no flag")
      cy
        .style()
        .selector("edge")
        .style({
          content: edgeLabels.off.content,
        })
    } else {
      console.log("si flag")
      cy
        .style()
        .selector("edge")
        .style({
          content: edgeLabels.on.content,
        })
    }
  };

  /**
   * Cerrar proyecto seleccionado
   */
  const onClose = () => {
    Swal.fire({
      text: "¿Seguro que deseas cerrar " + selectedProject.versionName + "?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--success)",
      cancelButtonColor: "var(--error)",
      confirmButtonText: "Si, seguro",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedProject();
        setChecked(false);
      }
    });
  };

  /**
   * Crear referencia al elemento de Cytoscape,
   * actuar el tamaño viewport del grafo,
   * establecer funcionalidad sobre nodos y arcos
   * @param {CytoscapeComponent} cy referencia al componente
   */
  const getCy = (cy) => {
    cyto = cy;
    //cyto.fit();
          
    //setEdgesLabel(false, cyto);
    //cyto.style().selector("node").style("background-color", "magenta").update(); // indicate the end of your new stylesheet so that it can be updated on elements
  };

  /**
   * Manejador de evento al seleccionar nodo
   * @param {Event} event referencia al elemento
   */
  const selectedNodeHandler = (evt) => {
    const nodeId = evt["target"]["_private"]["data"].id;
    nodesHelper.addNode(nodeId, selectedNodes, setSelectedNodes);
    console.log("hola");
    cy.getElementById(nodeId).stop();
    cy.getElementById(nodeId).animate(
      {
        style: {
          "background-color": "#ffc74d",
        },
      },
      {
        duration: 0,
      }
    );
    cy.animate(
      {
        fit: {
          eles: cyto.getElementById(nodeId),
          padding: 30,
        },
      },
      {
        duration: 100,
      }
    );
    evt.preventDefault();
  };

  /**
   * Manejador de evento al dejar de seleccionar nodo
   * @param {Event} event referencia al elemento
   */
  const unselectNodeHandler = (evt) => {
    const nodeId = evt["target"]["_private"]["data"].id;
    nodesHelper.removeNode(nodeId, selectedNodes, setSelectedNodes);
    cy.getElementById(nodeId).stop();
    console.log("aa");
    cy.fit();
    cy.getElementById(nodeId).animate(
      {
        style: {
          "background-color": "#18202C",
        },
      },
      {
        duration: 0,
      }
    );
  };

   useEffect(() => {
     if(cy){
       
      console.log("la locura jeje")
      
        cy.on("select", "node", selectedNodeHandler);
        cy.on("unselect", "node", unselectNodeHandler);
      
      
      
     }
  }, [cy]);

  useEffect(() => {
    if(cy){
         
     setEdgesLabel();
    }
 }, [checked, cy]);

  useEffect(() => {
    setLoad(true);
    setElementos(selectedProject.elements);
  }, [selectedProject]);

  useEffect(() => {
    if (load) {
      setLoad(false);
      setChecked(false)
    }
  }, [elementos, load]);

  return (
    <>
      {load ? (
        <Loader />
      ) : elementos ? (
        <div>
        <div className={classes.onClose}>
        <FormControlLabel
            control={<Switch checked={checked} onChange={toggleChecked} />}
            
            labelPlacement="start"
            style={{marginRight: 5}}
          />
          <IconButton
            color="inherit"
            aria-label="open drawer"
            
            onClick={onClose}
            edge="start"
          >
            <HighlightOffIcon />
          </IconButton></div>
          
          <CytoscapeComponent
            id="component"
            zoom={0.5}
            maxZoom={2}
            elements={CytoscapeComponent.normalizeElements(elementos)}
            className="component"
            layout={state.layout}
            stylesheet={state.stylesheet}
            pan={{ x: 150, y: 30 }}
            cy={(cyt) => {
              cyto = cyt;
              setCy(cyt);      
            }}
          />
        </div>
      ) : null}
    </>
  );
};

/** Creacion de capa de estilos para el componente */
const useStyles = makeStyles((theme) => ({
  onClose: {
    position: "absolute",
    right: "18px",
    top: "75px",
    zIndex: 3,
  },
}));

export default Content;
