///<reference path="../lib/ts-types/vue.d.ts"/>
import { GithubClient } from './FileSystem/GithubClient';
import { GithubFileSystem } from './FileSystem/GithubFileSystem';
import { LocalFileSystem } from './FileSystem/LocalFileSystem';
import { RemoteFileSystem } from './FileSystem/RemoteFileSystem';
import { StaticFileSystem } from './FileSystem/StaticFileSystem';
import { IFileSystem, IFsItem, FsItem } from './FileSystem/Common';
import { FsUri } from './FileSystem/FsUri';
import { FsSelector } from './FileSystem/FsSelector';
import Vue from 'vue';
import Component from 'vue-class-component';
declare var kaitaiFsFiles: string[];

function fsTest() {
    var queryParams: { access_token?: string; secret?: string } = {};
    location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => (<any>queryParams)[x[0]] = x[1]);

    var fs = new FsSelector();
    fs.addFs(new LocalFileSystem());

    var remoteFs = new RemoteFileSystem();
    remoteFs.mappings["127.0.0.1:8001/default"] = { secret: queryParams.secret };
    fs.addFs(remoteFs);

    var githubClient = new GithubClient(queryParams.access_token);
    var githubFs = new GithubFileSystem(githubClient);
    fs.addFs(githubFs);

    ['local:///folder/', 'remote://127.0.0.1:8001/default/folder/', 'github://koczkatamas/kaitai_struct_formats/archive/']
        .forEach(uri => fs.list(uri).then(items => console.log(items.map(item => `${item.uri.uri} (${item.uri.type})`))));
}

var staticFs = new StaticFileSystem();
kaitaiFsFiles.forEach(fn => staticFs.write("static://" + fn, new ArrayBuffer(0)));

staticFs.list("static://formats/").then(x => console.log(x.map(y => y.uri.uri)));

class FsTreeHandler {
    public root: FsTreeNode;

    constructor() {
        
    }
}

class FsTreeNode {
    public open = false;
    public childrenLoading = true;
    public children: FsTreeNode[] = [];

    constructor(public handler: FsTreeHandler, public text: string) { }

    add(children: FsTreeNode[]) {
        this.children.push(...children);
        return this;
    }

    isFolder() {
        console.log('isFolder', this.text);
        return this.children && this.children.length;
    }

    toggle() {
        if (this.isFolder)
            this.open = !this.open;
    }
}

var fsTreeHandler = new FsTreeHandler();
var data = new FsTreeNode(fsTreeHandler, '/').add([
    new FsTreeNode(fsTreeHandler, 'folder1').add([
        new FsTreeNode(fsTreeHandler, 'folder2').add([
            new FsTreeNode(fsTreeHandler, 'file1'),
            new FsTreeNode(fsTreeHandler, 'file2'),
        ]),
        new FsTreeNode(fsTreeHandler, 'file1'),
        new FsTreeNode(fsTreeHandler, 'file2'),
    ]),
    new FsTreeNode(fsTreeHandler, 'file1'),
    new FsTreeNode(fsTreeHandler, 'file2'),
]);

// define the item component
Vue.component('treeViewItem', {
    template: '#treeViewItem-template',
    props: {
        model: Object
    },
    computed: {
        isFolder() { return (<any>this).model.isFolder(); }
    },
    methods: {
        toggle() { (<any>this).model.toggle(); }
    }
});

Vue.component('treeView', { template: '#treeView-template', props: { model: Object } });

Vue.config.devtools = true;

@Component({
    props: { propMessage: String },
    template: '#app-template'
})
export default class App extends Vue {
    propMessage: string;
    // inital data
    msg: number = 123;
    // use prop values for initial data
    helloMsg: string = 'Hello, ' + this.propMessage;
    // lifecycle hook
    mounted() {
        //this.greet();
    }
    // computed
    get computedMsg() {
        return 'computed ' + this.msg;
    }
    // method
    greet() {
        alert('greeting: ' + this.msg);
    }
}

// boot up the demo
var demo = new Vue({
    el: '#tree',
    data: {
        treeData: data
    },
    components: {
        App
    }
});