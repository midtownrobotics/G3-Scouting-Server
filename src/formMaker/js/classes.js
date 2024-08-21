class SectionHead {
  constructor(name) {
    this.name = name;
    this.id = createId(name, 4);
  }

  editName(newName) {
    this.name = newName;
    sections[this.location].name = this.name;
    $(`#${this.id}head`).children().html(this.name);
  }

  add() {
    let sectionsLength = Object.keys(sections).length;
    sections["s"+(sectionsLength)] = {"name": this.name, "id": this.id, "childQuestions":{}, "object": this};
    this.location = "s"+(sectionsLength);
    $("#submitButton").before(`
      <div id="${this.id}head" class="section_head">
        <h2>${this.name}</h2>
      </div>
      <div id="${this.id}" class="question-block"></div>`
    );
  }

  delete(){
    
  }

  move(){
    
  }
}

class NumberInput {
  constructor(label, nameIsCustom, name, value, placeholder, readonly, required){
    this.type = "Number Input";
    this.label = label;
    this.nameIsCustom = nameIsCustom;
    this.name = name;
    this.value = value;
    this.placeholder = placeholder;
    this.readonly = readonly;
    this.required = required;
    this.id = createId(name, 4);
    this.index = Object.keys(questions).length;
    this.min;
    this.max;
    questions["q"+this.index] = this;
  }

  addToSection(index) {
    sections["s"+index].childQuestions["q"+(Object.keys(sections["s"+index].childQuestions).length)] = this;
    this.parent = "s"+index;
    this.parentIndex = Object.keys(sections["s"+index].childQuestions).length-1;
    $(`#${sections[this.parent].id}`).append(`<label class="numInput" for="${this.id}">${this.label}</label><input class="numInput" id="${this.id}" type="number" name="${this.name}" value="${this.value}" min="${this.min}" max=${this.max} placeholder="${this.placeholder}" ${(this.required == false) ? "" : "required"} ${(this.readonly == false) ? "" : "readonly"}><br>`);
    QidSearcher[this.id] = {"type" : this.type,  "qIndex" : this.index, "parent" : this.parent, "parentIndex" : this.parentIndex, "object" : this};
  }

  addMax(max) {
    this.max = max;
    $(`#${this.id}`).attr("max", max);
  }
  
  addMin(min) {
    this.min = min;
    $(`#${this.id}`).attr("min", min);
  }

  //options should be an array
  addList(options) {
    $("#datalists").prepend(`<datalist id="${this.id}Dlist"></datalist>`);
    $(`#${this.id}`).attr("list", `${this.id}Dlist`);
    for (let i = 0; i < options.length; i++) {
      $(`#${this.id}Dlist`).append(`<option value="${options[i]}">`);
    }
  }

  setCustomStep(step){
    this.step = step;
    $(`#${this.id}`).attr("step", step);
  }

  makeCustomError() {
    
  }

  applyAdminError(key){
    //For much much much later when I'm done with form Maker and ready to integrate with the admin page
  }

  addPattern(){

  }

  changeLabel(newLable){
    this.label = newLable;
    $(`#${this.id}`).prev().html(this.label);
  }

  changeAttr(nameOf, newVal) {
    this[nameOf] = newVal;
    $(`#${this.id}`).attr(nameOf, newVal);
  }

  changeInfo(nameOf, newVal) {
    this[nameOf] = newVal;
  }

  move(after, section) {
    $(`#${this.id}`).after(`#${after}`);
  }

  delete() {
    $(`#${this.id}`).prev().remove();
    $(`#${this.id}`).next().remove();
    $(`#${this.id}`).remove();
    $(`#elemPageFor${this.id}`).remove();
    let stuff = sections[this.parent].childQuestions;
    delete stuff[this.parentIndex];
    delete questions["q"+this.index];
    delete QidSearcher[this.id];
  }
}

class select {
  constructor(label, name, value, multiple, required, disabled, readonly){
    
  }

  addToSection() {
    
  }

  setSize(){
    
  }

  makeAutofocus() {
    
  }
}

class buttonElem {
  constructor(label, name, value, disabled, callback) {
    
  }

  addToSection(){
    
  }

  addPopoverTarget() {
    
  }

  addPopoverTargetaction() {

  }
}

class checkbox {
  constructor(label, value, name, diabled, required) {
    
  }

  addToSection() {

  }

  addBox(checked, name, value, disabled, required){
    
  }
}

class colorInput {
  constructor(label, value, name, disabled){
    
  }

  addToSection() {
    
  }
  
  makeCustomError() {

  }

  applyAdminError(key){
    //For much much much later when I'm done with form Maker and ready to integrate with the admin page
  }
}	

class dateInput {
  constructor(label, value, name, disabled, readonly, required){
    
  }

  addToSection() {
    
  }

  addMax(){
    
  }

  addMin() {
    
  }

  addStep() {
    
  }

  addList(options){
    
  }

  setCustomStep(step){
    
  }

  makeCustomError() {

  }

  applyAdminError(key){
    //For much much much later when I'm done with form Maker and ready to integrate with the admin page
  }
}	

class localDatetime {
  constructor(label, value, name, disabled, readonly, required) {
    
  }

  addToSection() {
    
  }

  addList(options){
    
  }

  addMax(){

  }

  setCustomStep(step){

  }

  addMin() {

  }

  addStep() {

  }

  makeCustomError() {

  }

  applyAdminError(key){
    //For much much much later when I'm done with form Maker and ready to integrate with the admin page
  }
}

class email {
  constructor(label, value, name, disabled, readonly, multiple, required, placeholder) {
    
  }
  
  addMaxlength(){

  }
  
  addMinlength(){

  }

  changeSize(){

  }

  addDirname(){
    
  }

  addPattern(){

  }
  
  makeCustomError() {

  }

  addList(options){

  }

  applyAdminError(key) {
    //For much much much later when I'm done with form Maker and ready to integrate with the admin page
  }
}

class file {
  constructor(label, value, name, disabled, required, capture, accept, multiple, readonly) {
    
  }
}

class hidden {
  constructor(label, name, value, disabled){

  }
  
  addDirname(){

  }
}

class image {
  constructor(label, name, src, required, disabled, alt, callback, height, readonly) {
    
  }

  setWidth() {
    
  }
}

class month {
  constructor(label, name, value, required, disabled, readonly){

  }
  
  setCustomStep(step){

  }

  
  addMax(){

  }

  addMin() {

  }
}

class password {
  constructor(label, name, value, required, disabled, placeholder, readonly){

  }

  changeSize(){

  }
  
  addMaxlength(){

  }
  
  addMinlength(){

  }

  addPattern(){

  }
}

class radio {
  constructor(label, name, value, required, disabled){

  }
  
  addBox(checked, name, value, disabled, required){

  }
}

class range {
  constructor(label, name, value, disabled){

  }
  
  addMax(){

  }

  addMin() {

  }

  addStep() {

  }

  labelEnds() {
    
  }
}

class reset {
  constructor(label, name, value, required, disabled, readonly){

  }
}

class search {
  constructor(label, name, value, required, disabled, placeholder, readonly){

  }
  
  addMaxlength(){

  }
  
  addDirname(){

  }

  addMinlength(){

  }

  changeSize(){

  }

  addPattern(){

  }
}

class tel {
  constructor(label, name, value, required, disabled, placeholder, readonly){

  }
  
  addDirname(){

  }
  
  changeSize(){

  }

  addMaxlength(){
    
  }

  addMinlength(){

  }

  addPattern(){

  }
}

class text {
  constructor(label, name, value, required, disabled, placholder, readonly){

  }
  
  addMaxlength(){
    
  }

  changeSize(){
    
  }
  
  addDirname(){

  }

  addMinlength(){

  }

  addPattern(){
    
  }
}

class time {
  constructor(label, name, value, required, disabled, readonly){

  }

  setCustomStep(step){

  }
  
  addMax(){

  }

  addMin() {

  }
}

class url {
  constructor(label, name, value, required, disabled, placeholder, readonly){

  }
  
  addMaxlength(){

  }

  changeSize(){

  }

  addMinlength(){

  }

  addPattern(){

  }
}

class week {
  constructor(label, name, value, required, disabled, readonly){

  }

  setCustomStep(step){

  }
  
  addMax(){

  }

  addMin() {

  }
}

class textarea {
  constructor(label, autocapitalize, readonly, rows, spellcheck, autocorrect, cols, disabled, name, placeholder){
    
  }

  setDirname(){
    
  }

  maxlength(){
    
  }

  minlength(){
    
  }
  
  setAsAutofocus(){
    
  }

  setWrap(){
    
  }

  makeResizable(){
    
  }
}

class output {
  constructor(name, inputs){
    
  }

  setCalculation(){
    
  }
}

class fieldset {
   
}

class linearScale {
  
}

class radioGrid {
  
}

class checkBoxGrid {
  
}

class pointsInput {
  
}

class dragAndDrop {
  
}

function applyGlobalAttribute(attr, value, id) {
  /**
  accesskey
  autocapitalize
  autofocus
  classle
  enterke
  contenteditable
  dir
  draggabyhint
  exportparts
  hidden
  inert
  inputmode
  is
  itemid
  itemprop
  itemref
  itemscope
  itemtype
  lang
  nonce
  part
  popover
  role
  slot
  spellcheck
  style
  tabindex
  title
  translate
  **/
}