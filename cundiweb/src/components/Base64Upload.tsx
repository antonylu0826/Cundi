
import React from 'react';
import { Upload } from 'antd';

interface Base64UploadProps {
    value?: string;
    onChange?: (value: string) => void;
}

export const Base64Upload: React.FC<Base64UploadProps> = ({ value, onChange }) => {
    return (
        <Upload
            listType="picture-card"
            maxCount={1}
            showUploadList={false}
            beforeUpload={(file) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const base64 = reader.result as string;
                    // Remove data:image/...;base64, prefix
                    const rawBase64 = base64.split(",")[1];
                    onChange?.(rawBase64);
                };
                return false;
            }}
        >
            {value ? <img src={`data:image/png;base64,${value}`} alt="avatar" style={{ width: '100%' }} /> : (
                <div>
                    <div style={{ marginTop: 8 }}>Upload</div>
                </div>
            )}
        </Upload>
    );
};
