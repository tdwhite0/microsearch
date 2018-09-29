import * as React from 'react';
import { IPropertyFieldMicrosearchPropsInternal } from './PropertyFieldMicrosearch';
import { observable, action } from "mobx";
import { observer } from "mobx-react";

class MicrosearchStore {
    @observable queryText: string;

    @action setQueryText(text: string){
        this.queryText= text;
    }
}

const store = new MicrosearchStore();
/**
 * @interface
 * PropertyFieldDisplayModeHost properties interface
 *
 */
export interface IPropertyFieldMicrosearchHostProps extends IPropertyFieldMicrosearchPropsInternal {
}

export interface IPropertyFieldMicrosearchHostState {
  mode?: string;
  overList?: boolean;
  overTiles?: boolean;
  errorMessage?: string;
  queryText: string;
}

/**
 * @class
 * Renders the controls for PropertyFieldDisplayMode component
 */
@observer
export default class PropertyFieldDisplayModeHost extends React.Component<IPropertyFieldMicrosearchHostProps, IPropertyFieldMicrosearchHostState> {

  private latestValidateValue: string;
  private delayedValidate: (value: string) => void;
  // private _key: string;

  /**
   * @function
   * Constructor
   */
  constructor(props: IPropertyFieldMicrosearchHostProps) {
    super(props);
    //Bind the current object to the external called onSelectDate method
    this.onValueChanged = this.onValueChanged.bind(this);
   
    this.state = {
      mode: this.props.initialValue != null && this.props.initialValue != '' ? this.props.initialValue : '',
      overList: false, overTiles: false,
      errorMessage: '',
      queryText: ''
    };

    this.validate = this.validate.bind(this);
    this.notifyAfterValidate = this.notifyAfterValidate.bind(this);
    this.delayedValidate = function(){
        console.log("running delayed validate")
    }

    this.onChange = this.onChange.bind(this);
  }

  /**
   * @function
   * Function called when the selected value changed
   */
  private onValueChanged(element: any, value: string): void {
    this.delayedValidate(value);
  }

  /**
   * @function
   * Validates the new custom field value
   */
  private validate(value: string): void {
    if (this.props.onGetErrorMessage === null || this.props.onGetErrorMessage === undefined) {
      this.notifyAfterValidate(this.props.initialValue as any, value);
      return;
    }

    if (this.latestValidateValue === value)
      return;
    this.latestValidateValue = value;

    var result: string | PromiseLike<string> = this.props.onGetErrorMessage(value || '');
    if (result !== undefined) {
      if (typeof result === 'string') {
        if (result === undefined || result === '')
          this.notifyAfterValidate(this.props.initialValue as any, value);
        this.setState({ errorMessage : result });
        this.setState(this.state);
      }
      else {
        result.then((errorMessage: string) => {
          if (errorMessage === undefined || errorMessage === '')
            this.notifyAfterValidate(this.props.initialValue as any, value);
          this.setState({ errorMessage : errorMessage });
          this.setState(this.state);
        });
      }
    }
    else {
      this.notifyAfterValidate(this.props.initialValue as any, value);
    }
  }

  /**
   * @function
   * Notifies the parent Web Part of a property value change
   */
  private notifyAfterValidate(oldValue: string, newValue: string) {
    if (this.props.onPropertyChange && newValue != null) {
      this.props.properties[this.props.targetProperty] = newValue;
      this.props.onPropertyChange(this.props.targetProperty, oldValue, newValue);
      if (!this.props.disableReactivePropertyChanges && this.props.render != null)
        this.props.render();
    }
  }

  private onChange(e: any){
    console.log("ONCHANGE", e.target.value)
    this.setState({ queryText: e.target.value })
    store.setQueryText(e.target.value);
  }

  /**
   * @function
   * Called when the component will unmount
   */
  public componentWillUnmount() {
    console.log("COMPONENT WILL UNMOUNT")
  }

  /**
   * @function
   * Renders the control
   */
  public render(): JSX.Element {

    return (
      <div style={{ marginBottom: '8px'}}>
      <div>
          Query Text
      </div>
        <input value={store.queryText} onChange={this.onChange} />
      </div>
    );
  }
}
