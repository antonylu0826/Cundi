
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Emoji from '@tiptap/extension-emoji';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { MathExtension } from '@aarkue/tiptap-math-extension';
import 'katex/dist/katex.min.css';
import Youtube from '@tiptap/extension-youtube';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import { Button, Space, theme, Popover, ColorPicker } from 'antd';
import {
    BoldOutlined,
    ItalicOutlined,
    StrikethroughOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    CodeOutlined,
    UndoOutlined,
    RedoOutlined,
    TableOutlined,
    DeleteRowOutlined,
    DeleteColumnOutlined,
    InsertRowBelowOutlined,
    InsertRowAboveOutlined,
    InsertRowRightOutlined,
    InsertRowLeftOutlined,
    CheckSquareOutlined,
    SmileOutlined,
    FunctionOutlined,
    YoutubeOutlined,
    BgColorsOutlined,
    FontColorsOutlined
} from '@ant-design/icons';

export interface TiptapEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange, disabled }) => {
    const { token } = theme.useToken();
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Emoji.configure({
                enableEmoticons: true,
            }),
            MathExtension.configure({
                evaluation: false,
            }),
            Youtube.configure({
                controls: false,
            }),
            Highlight,
            TextStyle,
            Color,
            Placeholder.configure({
                placeholder: 'Write something...',
            }),
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                style: 'outline: none; min-height: 150px;',
            },
            handlePaste: (view, event, slice) => {
                const items = Array.from(Object.values(event.clipboardData?.items || {}));
                const item = items.find(item => item.type.indexOf('image') === 0);

                if (item) {
                    event.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                            const base64 = readerEvent.target?.result;
                            if (typeof base64 === 'string') {
                                view.dispatch(view.state.tr.replaceSelectionWith(
                                    view.state.schema.nodes.image.create({ src: base64 })
                                ));
                            }
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }
                }
                return false;
            }
        }
    });

    useEffect(() => {
        if (editor && value !== undefined && value !== editor.getHTML()) {
            if (editor.getText() === '' && value) {
                editor.commands.setContent(value);
            } else if (value !== editor.getHTML()) {
                if (!editor.isFocused) {
                    editor.commands.setContent(value);
                }
            }
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div
            style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
                overflow: 'hidden',
                backgroundColor: token.colorBgContainer,
            }}
        >
            <div style={{
                padding: '8px',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorFillQuaternary,
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <Space>
                    <Button
                        type={editor.isActive('bold') ? 'primary' : 'text'}
                        icon={<BoldOutlined />}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={disabled}
                        size="small"
                    />
                    <Button
                        type={editor.isActive('highlight') ? 'primary' : 'text'}
                        icon={<BgColorsOutlined />}
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        disabled={disabled}
                        size="small"
                        title="Highlight"
                    />
                    <ColorPicker
                        value={editor.getAttributes('textStyle').color}
                        onChange={(color, hex) => {
                            editor.chain().focus().setColor(hex).run();
                        }}
                        disabled={disabled}
                    >
                        <Button
                            type="text"
                            icon={<FontColorsOutlined style={{ color: editor.getAttributes('textStyle').color }} />}
                            disabled={disabled}
                            size="small"
                            title="Text Color"
                        />
                    </ColorPicker>
                    <Button
                        type={editor.isActive('italic') ? 'primary' : 'text'}
                        icon={<ItalicOutlined />}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={disabled}
                        size="small"
                    />
                    <Button
                        type={editor.isActive('strike') ? 'primary' : 'text'}
                        icon={<StrikethroughOutlined />}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={disabled}
                        size="small"
                    />
                    <Button
                        type={editor.isActive('bulletList') ? 'primary' : 'text'}
                        icon={<UnorderedListOutlined />}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        disabled={disabled}
                        size="small"
                    />
                    <Button
                        type={editor.isActive('orderedList') ? 'primary' : 'text'}
                        icon={<OrderedListOutlined />}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        disabled={disabled}
                        size="small"
                    />
                    <Button
                        type={editor.isActive('codeBlock') ? 'primary' : 'text'}
                        icon={<CodeOutlined />}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        disabled={disabled}
                        size="small"
                    />
                    <Button
                        type={editor.isActive('taskList') ? 'primary' : 'text'}
                        icon={<CheckSquareOutlined />}
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        disabled={disabled}
                        size="small"
                    />
                    <Button
                        type={editor.isActive('math') ? 'primary' : 'text'}
                        icon={<FunctionOutlined />}
                        onClick={() => (editor.chain().focus() as any).toggleMath().run()}
                        disabled={disabled}
                        size="small"
                        title="Math (LaTeX)"
                    />
                    <Button
                        type={editor.isActive('youtube') ? 'primary' : 'text'}
                        icon={<YoutubeOutlined />}
                        onClick={() => {
                            const url = window.prompt('Enter YouTube URL');
                            if (url) {
                                editor.commands.setYoutubeVideo({ src: url });
                            }
                        }}
                        disabled={disabled}
                        size="small"
                        title="YouTube"
                    />
                    <Button
                        type={editor.isActive('table') ? 'primary' : 'text'}
                        icon={<TableOutlined />}
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        disabled={disabled}
                        size="small"
                        title="Insert Table"
                    />
                    <Button
                        type="text"
                        icon={<DeleteRowOutlined />}
                        onClick={() => editor.chain().focus().deleteTable().run()}
                        disabled={!editor.can().deleteTable() || disabled}
                        size="small"
                        title="Delete Table"
                    />
                    <Popover
                        content={
                            <EmojiPicker
                                onEmojiClick={(emojiData: EmojiClickData) => {
                                    editor.chain().focus().insertContent(emojiData.emoji).run();
                                }}
                                width={350}
                                height={400}
                            />
                        }
                        trigger="click"
                        placement="bottom"
                    >
                        <Button
                            type="text"
                            icon={<SmileOutlined />}
                            disabled={disabled}
                            size="small"
                            title="Emoji"
                        />
                    </Popover>
                    {editor.isActive('table') && (
                        <>
                            <Button
                                type="text"
                                icon={<InsertRowAboveOutlined />}
                                onClick={() => editor.chain().focus().addRowBefore().run()}
                                disabled={disabled}
                                size="small"
                                title="Add Row Before"
                            />
                            <Button
                                type="text"
                                icon={<InsertRowBelowOutlined />}
                                onClick={() => editor.chain().focus().addRowAfter().run()}
                                disabled={disabled}
                                size="small"
                                title="Add Row After"
                            />
                            <Button
                                type="text"
                                icon={<DeleteRowOutlined style={{ color: 'red' }} />}
                                onClick={() => editor.chain().focus().deleteRow().run()}
                                disabled={!editor.can().deleteRow() || disabled}
                                size="small"
                                title="Delete Row"
                            />
                            <Button
                                type="text"
                                icon={<InsertRowLeftOutlined />}
                                onClick={() => editor.chain().focus().addColumnBefore().run()}
                                disabled={disabled}
                                size="small"
                                title="Add Column Before"
                            />
                            <Button
                                type="text"
                                icon={<InsertRowRightOutlined />}
                                onClick={() => editor.chain().focus().addColumnAfter().run()}
                                disabled={disabled}
                                size="small"
                                title="Add Column After"
                            />
                            <Button
                                type="text"
                                icon={<DeleteColumnOutlined style={{ color: 'red' }} />}
                                onClick={() => editor.chain().focus().deleteColumn().run()}
                                disabled={!editor.can().deleteColumn() || disabled}
                                size="small"
                                title="Delete Column"
                            />
                        </>
                    )}
                </Space>
                <Space style={{ marginLeft: 'auto' }}>
                    <Button
                        type="text"
                        icon={<UndoOutlined />}
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo() || disabled}
                        size="small"
                    />
                    <Button
                        type="text"
                        icon={<RedoOutlined />}
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo() || disabled}
                        size="small"
                    />
                </Space>
            </div>
            <style>{`
                .ProseMirror pre {
                    background: ${token.colorFillTertiary};
                    color: ${token.colorText};
                    font-family: 'JetBrainsMono', 'Courier New', monospace;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                }
                .ProseMirror pre code {
                    color: inherit;
                    padding: 0;
                    background: none;
                    font-size: 0.8rem;
                }
                .ProseMirror p {
                    margin-bottom: 0px;
                }
                .ProseMirror:focus {
                    outline: none;
                }
                .ProseMirror table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 0;
                    overflow: hidden;
                }
                .ProseMirror td, .ProseMirror th {
                    min-width: 1em;
                    border: 2px solid ${token.colorBorder};
                    padding: 3px 5px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .ProseMirror th {
                    font-weight: bold;
                    text-align: left;
                    background-color: ${token.colorFillQuaternary};
                }
                .ProseMirror .selectedCell:after {
                    z-index: 2;
                    position: absolute;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(200, 200, 255, 0.4);
                    pointer-events: none;
                }
                .ProseMirror .column-resize-handle {
                    position: absolute;
                    right: -2px;
                    top: 0;
                    bottom: -2px;
                    width: 4px;
                    background-color: #adf;
                    pointer-events: none;
                }
                ul[data-type="taskList"] {
                    list-style: none;
                    padding: 0;
                }
                ul[data-type="taskList"] li {
                    display: flex;
                    align-items: center;
                }
                ul[data-type="taskList"] li > label {
                    flex: 0 0 auto;
                    margin-right: 0.5rem;
                    user-select: none;
                }
                ul[data-type="taskList"] li > div {
                    flex: 1 1 auto;
                }
                ul[data-type="taskList"] input[type="checkbox"] {
                   cursor: pointer;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: ${token.colorTextPlaceholder};
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
            `}</style>
            <div style={{
                padding: '12px',
                minHeight: '150px',
                color: token.colorText,
                backgroundColor: token.colorBgContainer
            }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};
