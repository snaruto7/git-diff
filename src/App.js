import React, {useState, useCallback} from 'react';
import ReactDOM from 'react-dom';
import {mapValues} from 'lodash';
import {Input, Button} from 'antd';
import {diffLines, formatLines} from 'unidiff';
import {parseDiff, Diff, Hunk, getChangeKey} from 'react-diff-view';
import {useInput} from './hooks';
import {useConversations, Conversation} from './comments';

import 'antd/dist/antd.min.css'
import 'react-diff-view/style/index.css';
import './styles.css'

const EMPTY_HUNKS = [];

function App(){
    const oldText = useInput('');
    const newText = useInput('');
    const [{type, hunks}, setDiff] = useState('');
    const updateDiffText = useCallback(() => {
        const diffText = formatLines(diffLines(oldText.value, newText.value), {context: 2});
        const [diff] = parseDiff(diffText, {nearbySequences: 'zip'});
        setDiff(diff);
    }, [oldText.value, newText.value, setDiff]);
    const [conversations, {initConversation, addComment}] = useConversations();
    const codeEvents = {
        onDoubleClick({change}){
            const key = getChangeKey(change);
            if(!conversations[key]){
                initConversation(key);
            }
        },
    };
    const widgets = mapValues(conversations, ({comments}, changeKey) =>(
        <Conversation changeKey={changeKey} comments={comments} onSubmitComment={addComment} />
    ));
    return (
        <div>
            <header className="header">
                <div className="input">
                    <Input.TextArea className="text" rows={30} placeholder="old text..." {...oldText} />
                    <Input.TextArea className="text" rows={30} placeholder="new text..." {...newText} />
                </div>
                <Button className="submit" type="primary" onClick={updateDiffText}>
                    GENERATE DIFF
                </Button>
            </header>
            <main>
                <Diff viewType="unified" diffType={type} hunks={hunks || EMPTY_HUNKS}>
                    {hunks =>
                        hunks.map(hunk => (
                            <Hunk key={hunk.content} hunk={hunk} codeEvents={codeEvents} widgets={widgets} />
                        ))
                    }
                </Diff>
            </main>
        </div>
    );
}

export default App;
