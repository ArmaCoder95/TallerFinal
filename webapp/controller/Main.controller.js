sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, BusyIndicator, FilterOperator, Filter) {
        "use strict";

        return Controller.extend("tallerfinal.tallerfinal.controller.Main", {
            onInit: function () {
            },
            onAfterRendering: function() {
                this.mmodelo = this.getView().getModel("mmodelo");
                this.odataSrv = this.getView().getModel("odataSrv");
                this.odataSrv2 = this.getView().getModel("odataSrv2");

                this.getMateriales();

                this.Editar = sap.ui.xmlfragment("tallerfinal.tallerfinal.view.fragments.Editar", this);
                this.getView().addDependent(this.Editar);
            },
            getMateriales: function(){
                var that = this;
                BusyIndicator.show(0);
                this.odataSrv.read("/materialesSet", {
                    success: function(res){
                        that.mmodelo.setProperty("/Materiales", res.results);
                        BusyIndicator.hide();
                    },
                    error: function(err){
                        MessageBox.warning("Error en al lectura");
                    }
                });
            },
            onSearch: function(oEvent){
                var sQuery = oEvent.getSource().getValue();
                var aFilters = [];
                if(sQuery && sQuery.length > 0){
                    var filter1 = new Filter("Matnr", FilterOperator.Contains, sQuery);
                    var filter2 = new Filter("Werks", FilterOperator.Contains, sQuery);
                    aFilters = new Filter([filter1, filter2]);
                }else{
                    MessageBox.warning("La busqueda debe ser con al menos un caracter."); 
                }

                var listtable = this.getView().byId("idProductsTable").getBinding("items");
                    listtable.filter(aFilters, "Application");
            },
            onPress: function(){
                var that = this;
                var LineaMat = Object.assign({}, this.mmodelo.getProperty("/LineaMaterial"));
                var oEntry = LineaMat;
                //this.mmodelo.getProperty("/Materiales").push(LineaMat);
                BusyIndicator.show(0);
                this.odataSrv.create("/materialesSet", oEntry, {
                    method: "POST",
                    success: function(data){
                        MessageBox.success("Material: " + LineaMat.Matnr);
                        that.getMateriales();
                        BusyIndicator.hide();
                    },
                    error: function (error){
                    }
                })
                this.mmodelo.refresh(true);
            },
            onEditar: function(oEvent){
                var LineaMaterial = oEvent.getSource().getBindingContext('mmodelo').sPath;
                var LineaActual = Object.assign({}, this.mmodelo.getProperty(LineaMaterial));

                this.mmodelo.setProperty("/path", LineaMaterial);
                this.mmodelo.setProperty("/LineaMaterialEdit", LineaActual);
                
                this.Editar.open();
            },
            onAceptar: function(oEvent){
                var that = this;
                var v_path = this.mmodelo.getProperty("/path")
                var LineaEditada = this.mmodelo.getProperty("/LineaMaterialEdit");

                //this.mmodelo.setProperty(v_path, LineaEditada);
                //this.mmodelo.refresh(true);
                

                BusyIndicator.show(0);
                this.odataSrv.update("/materialesSet('" + LineaEditada.Matnr + "')", LineaEditada, {
                    success: function(res){
                        MessageBox.success("Material editado: " + LineaEditada.Matnr);
                        that.getMateriales();
                        
                        that.Editar.close();
                        BusyIndicator.hide();
                    },
                    error: function(err){
                        MessageBox.warning("Error");
                    }
                });


            },
            onClose: function(oEvent){
                this.Editar.close();
            },
            onDelete: function(oEvent){
                var that = this;
                var v_path = oEvent.getSource().getParent().getBindingContext('mmodelo').sPath;
                var lineaactual =  this.mmodelo.getProperty(v_path);
            
                var v_Materiales = this.mmodelo.getProperty("/Materiales");
                var cod_path = v_path.split("/");

                MessageBox.show("¿Estas seguro de borrar el material?", {
                    icon: MessageBox.Icon.WARNING,
                    title: "Confirmar",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction){
                        if(oAction === MessageBox.Action.YES){
                            //v_Materiales.splice(cod_path[2], 1);
                            //that.mmodelo.refresh(true);

                            BusyIndicator.show(0);
                            that.odataSrv.remove("/materialesSet('" + lineaactual.Matnr + "')", {
                                success: function(res){
                                    MessageBox.success("Material eliminado: " + lineaactual.Matnr);
                                    that.getMateriales();
                                    BusyIndicator.hide();
                                },
                                error: function(err){
                                    MessageBox.warning("Error");
                                }
                            });

                        }else if(oAction === MessageBox.Action.NO){
                            return;
                        }
                    }
                });
            }
        });
    });
