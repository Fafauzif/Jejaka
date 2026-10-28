import test from 'node:test';
import assert from 'node:assert/strict';
import {buildNotebookHTML} from '../notebook-export.js';
test('portable notebook keeps chosen text, English and captured image',()=>{
 const html=buildNotebookHTML({entries:[{title:'Bridge',text:'Pilihan saya',textEn:'My view',photo:'data:image/jpeg;base64,/9j/AA=='}]});
 assert.match(html,/Pilihan saya/);assert.match(html,/My view/);assert.match(html,/<img src="data:image\/jpeg;base64,/);assert.match(html,/bukan foto arsip/);assert.ok(!html.includes('<script'));assert.ok(!html.includes('http-equiv="refresh"'));
});
test('saved notebook strings cannot create executable markup',()=>{
 const html=buildNotebookHTML({entries:[{title:'<script>alert(1)</script>',text:'<img onerror="alert(1)">',textEn:'& hi',photo:'data:image/jpeg;base64,AA" onerror="x'}]});
 assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img '));assert.match(html,/&lt;script&gt;/);assert.match(html,/&amp; hi/);
});
test('empty notebook and invalid image remain readable',()=>{
 assert.match(buildNotebookHTML({entries:[]}),/Belum ada pengamatan/);
 assert.ok(!buildNotebookHTML({entries:[{photo:'https://example.com/tracker.jpg'}]}).includes('<img '));
});
