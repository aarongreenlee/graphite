import { getMonthDayYear } from './getMonthDayYear';
import {
  putFile,
  getFile
} from 'blockstack';
import update from 'immutability-helper';
const uuidv4 = require('uuid/v4');

export function loadForms() {
  getFile('forms.json', {decrypt: true})
    .then((fileContents) => {
      console.log(JSON.parse(fileContents))
      this.setState({
        forms: JSON.parse(fileContents || '{}')
      })
    })
    .then(() => {
      const thisForm = this.state.forms.find((form) => {
        return form.id.toString() === window.location.href.split('/forms/form/')[1] //this is comparing a string to a string
      });
      let index = thisForm && thisForm.id;
      function findObjectIndex(form) {
        return form.id === index; //this is comparing a number to a number
      }
      this.setState({index: this.state.forms.findIndex(findObjectIndex)})
    })
    .then(() => {
      this.loadSingleForm();
    })
    .catch(error => {
      console.log(error);
    })
}

export function loadSingleForm() {
  getFile('forms/' + window.location.href.split('/forms/form/')[1] + '.json', {decrypt: true})
    .then((fileContents) => {
      console.log(JSON.parse(fileContents))
      this.setState({
        singleForm: JSON.parse(fileContents || '{}'),
        formContents: JSON.parse(fileContents || '{}').formContents,
        tags: JSON.parse(fileContents || '{}').tags
      })
    })
    .then(() => {
      window.$('.modal').modal();
    })
    .catch(error => {
      console.log(error);
    })
}

export function handleAddForm() {
  const object = {};
  object.id = uuidv4();
  if(this.state.title === "" || this.state.title === undefined) {
    object.title = "Untitled Form";
  } else {
    object.title = this.state.title;
  }
  object.formContents = [];
  object.tags = [];
  object.date = getMonthDayYear();
  this.setState({ forms: [...this.state.forms, object ], singleForm: object });
  setTimeout(this.saveForm, 300);
}

export function updateForm() {
  const object = {};
  object.id = window.location.href.split('/forms/form/')[1];
  if(this.state.title !=="") {
    object.title = this.state.title;
  } else {
    object.title = this.state.singleForm.title;
  }
  object.formContents = this.state.formContents;
  object.tags = this.state.singleForm.tags;
  object.date = getMonthDayYear();
  this.setState({ singleForm: object });
  const index = this.state.index;
  const updatedForm = update(this.state.forms, {$splice: [[index, 1, object]]});
  this.setState({forms: updatedForm})
  window.Materialize.toast("Form saved!", 3000);
  setTimeout(this.saveForm, 300);
}

export function saveForm() {
  //TODO refactor to post to account owner's storage only here
  putFile('forms/' + this.state.singleForm.id + '.json', JSON.stringify(this.state.singleForm), {encrypt: true})
    .catch(error => {
      console.log(error);
    })
  putFile('forms.json', JSON.stringify(this.state.forms), {encrypt: true})
    .then(() => {
      if(window.location.pathname === '/forms') {
        window.location.replace(window.location.origin + '/forms/form/' + this.state.singleForm.id);
      } else {
        this.loadForms();
      }
    })
}

export function addQuestion(props) {
  // console.log(props);
  const object = {};
  object.id = uuidv4();
  object.questionType = props;
  object.position = this.state.formContents.length + 1;
  if(props === "multipleChoice" || props === "dropdown" || props === "checkbox") {
    object.options = [];
  }
  object.questionTitle = "New Question";
  object.helpText = "";
  this.setState({ formContents: [...this.state.formContents, object] });
  setTimeout(this.updateForm, 300)
}

export function formTitleChange(e) {
  this.setState({ title: e.target.value });
}

export function handleQuestionTitle(e) {
  this.setState({ questionTitle: e.target.value });
}

export function handleHelpText(e) {
  this.setState({ helpText: e.target.value });
}

export function handleOptionValue(e) {
  this.setState({ optionValue: e.target.value })
}

export function addOptions(props) {
  let qObject = this.state.formContents.find(function(element) {
    return element.id === props.id
  });
  let options = qObject.options;
  const optionObject = {};
  optionObject.id = uuidv4();
  optionObject.option = this.state.optionValue;
  options.push(optionObject);

  const thisQ = this.state.formContents.find((q) => {
    return q.id.toString() === props.id //this is comparing a string to a string
  });
  let index = thisQ && thisQ.id;
  function findObjectIndex(q) {
    return q.id === index; //this is comparing a number to a number
  }
  const object = {};
  object.id = props.id;
  object.required = false;
  object.questionType = props.questionType;
  if(this.state.questionTitle !== "") {
    object.questionTitle = this.state.questionTitle;
  } else {
    object.questionTitle = props.questionTitle;
  }
  object.position = props.position;
  if(props.questionType === "multipleChoice" || props.questionType === "dropdown" || props.questionType === "checkbox") {
    if(options === []) {
      object.options = [];
    } else {
      object.options = options;
    }
  }
  if(this.state.helpText !=="") {
    object.helpText = this.state.helpText;
  } else {
    object.helpText = props.helpText;
  }
  const indexCheck = this.state.formContents.findIndex(findObjectIndex);
  const updatedQuestion = update(this.state.formContents, {$splice: [[indexCheck, 1, object]]});
  this.setState({ formContents: updatedQuestion, optionValue: "" });
  setTimeout(this.updateForm, 300)
}

export function updateQuestion(props) {
  const thisQ = this.state.formContents.find((q) => {
    return q.id.toString() === props.id //this is comparing a string to a string
  });
  let index = thisQ && thisQ.id;
  function findObjectIndex(q) {
    return q.id === index; //this is comparing a number to a number
  }
  const object = {};
  object.id = props.id;
  object.questionType = props.questionType;
  object.required = props.required;
  if(this.state.questionTitle !== "") {
    object.questionTitle = this.state.questionTitle;
  } else {
    object.questionTitle = props.questionTitle;
  }
  object.position = props.position;
  if(props === "multipleChoice" || props === "dropdown" || props === "checkbox" || props.questionType === "multipleChoice" || props.questionType === "dropdown" || props.questionType === "checkbox") {
    if(this.state.options.length > 0) {
      object.options = this.state.options;
    } else {
      if(this.state.deleteLastOption) {
        object.options = this.state.options;
      } else {
        object.options = props.options;
      }
    }
  }
  if(this.state.helpText !=="") {
    object.helpText = this.state.helpText;
  } else {
    object.helpText = props.helpText;
  }
  const indexCheck = this.state.formContents.findIndex(findObjectIndex);
  const updatedQuestion = update(this.state.formContents, {$splice: [[indexCheck, 1, object]]});
  this.setState({ formContents: updatedQuestion, required: false, deleteLastOption: false });
  setTimeout(this.updateForm, 300)
}

export function deleteQuestion(props) {
  const thisQ = this.state.formContents.find((q) => {
    return q.id.toString() === props.id //this is comparing a string to a string
  });
  let index = thisQ && thisQ.id;
  function findObjectIndex(q) {
    return q.id === index; //this is comparing a number to a number
  }
  const indexCheck = this.state.formContents.findIndex(findObjectIndex);
  const newFormContents = update(this.state.formContents, {$splice: [[indexCheck, 1]]})
  this.setState({ formContents: newFormContents });
  setTimeout(this.updateForm, 300);
}

export function removeOption(props) {
  const thisQ = this.state.formContents.find((q) => {
    return q.id.toString() === props.q.id //this is comparing a string to a string
  });
  let index = thisQ && thisQ.id;
  function findObjectIndex(q) {
    return q.id === index; //this is comparing a number to a number
  }
  // const indexCheck = this.state.formContents.findIndex(findObjectIndex);
  // const thisO = thisQ.options.find((o) => {
  //   return o.id.toString() === props.o.id //this is comparing a string to a string
  // });
  // let indexO = thisO && thisO.id;
  // function findObjectIndex(o) {
  //   return o.id === indexO; //this is comparing a number to a number
  // }
  const indexOCheck = props.q.options.findIndex(findObjectIndex);
  const newOptions = update(props.q.options, {$splice: [[indexOCheck, 1]]});
  if(newOptions.length < 1) {
    this.setState({ options: newOptions, deleteLastOption: true }, () => {
     this.updateQuestion(props.q)
    });
  } else {
    this.setState({
          options: newOptions
      }, () => {
       this.updateQuestion(props.q)
      })
  }
}

export function handleRequired(props) {
    const object = props;
    props.required = !props.required;
    this.updateQuestion(object);
}

export function requiredSave(props) {
  this.updateQuestion(props);
}

export function publishForm() {
  console.log(this.state.singleForm.formContents.map(a => a.questionTitle))
  const object = {};
  object.title = this.state.singleForm.title;
  object.content = this.state.singleForm.formContents.map(a => a.questionTitle);
  object.id = this.state.singleForm.id;
  object.updated = getMonthDayYear();
  object.sharedWith = [];
  object.tags = [];
  object.form = true;
  const objectTwo = {};
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = object.updated
  objectTwo.sharedWith = [];
  objectTwo.tags = [];
  objectTwo.form = true;

  let sheets = this.state.sheets;
  const thisSheet = sheets.find((sheet) => {
    return sheet.id.toString() === object.id //this is comparing a string to a string
  });
  if(thisSheet) {
    console.log("found it")
    let index = thisSheet && thisSheet.id;
    function findObjectIndex(sheet) {
      return sheet.id === index; //this is comparing a number to a number
    }
    this.setState({index: sheets.findIndex(findObjectIndex)}, () => {
      getFile('/sheets/' + object.id + '.json', {decrypt: false})
       .then((fileContents) => {
         console.log("loading file: ");
         if(fileContents) {
           this.setState({ grid: JSON.parse(fileContents).content  })
         }
       })
       .then(() => {
         const object = {};
         object.title = this.state.singleForm.title;
         object.content = this.state.grid;
         object.id = window.location.href.split('forms/form/')[1];
         object.updated = getMonthDayYear();
         object.sharedWith = this.state.sharedWith;
         object.fileType = "sheets";
         object.form = true;
         const objectTwo = {};
         objectTwo.title = object.title;
         objectTwo.id = object.id;
         objectTwo.updated = object.updated;
         objectTwo.sharedWith = object.sharedWith;
         objectTwo.fileType = "sheets";
         objectTwo.form = true;
         console.log(object);
         const index = this.state.index;
         const updatedSheet = update(this.state.sheets, {$splice: [[index, 1, objectTwo]]});  // array.splice(start, deleteCount, item1)
         this.setState({sheets: updatedSheet, singleSheet: object });
         this.saveNewFormToSheet();
       })
        .catch(error => {
          console.log(error);
        });
    })

  } else {
    console.log("Nope")
    this.setState({
      sheets: [...this.state.sheets, objectTwo],
      filteredSheets: [...this.state.filteredSheets, objectTwo],
      tempSheetId: object.id,
      singleSheet: object
    }, () => {
      this.saveNewFormToSheet();
    });
  }
}

export function saveNewFormToSheet() {
  putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      this.saveFormToSingleSheet();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveFormToSingleSheet() {
  const file = window.location.href.split('forms/form/')[1];
  const fullFile = '/sheets/' + file + '.json'
  putFile(fullFile, JSON.stringify(this.state.singleSheet), {encrypt: false})
    .then(() => {
      console.log("Saved!");
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}