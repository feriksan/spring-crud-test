import React, {useState} from 'react';
import { Card, Space, Button, Row, Col, Timeline, Collapse, Tag, Modal, Image, Popconfirm } from 'antd';
import {
    FileOutlined,
    DownloadOutlined,
    EyeOutlined,
    ShareAltOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import API from '../helper/API.js'
const api = new API();

const DrawerContent = ({drawerData}) =>{

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState()
    const showModal = () => {
        console.log(drawerData)
        setIsModalOpen(true);
        previewFile(drawerData.filename + "/" + drawerData.subfolder)
    };
    const downloadHandler =() => {
        downloadFile(drawerData.filename + "/" + drawerData.subfolder)
    }
    const confirm = () =>
        new Promise((resolve) => {
            setTimeout(() => resolve(null), 3000);
            deleteFile(drawerData.subfolder + "/" + drawerData.filename + "/" + drawerData.id)
        });

    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    // console.log("Drawer Open" + drawerData)
    const onChange = (key) => {
        console.log(key);
      };
    const items = [
        {
          key: '1',
          label: 'Open to see history',
          children:
            <Timeline
                items={[
                    {
                        children: 'File Diupload',
                    },
                    {
                        children: 'User memberikan hak akses kepada User 2',
                    },
                    {
                        children: 'User 2 mengupdate file',
                    },
                    {
                        children: 'User 1 mengupdate file',
                    },
                ]}
            />,
        }
      ];
    const kartuItem = [
        <Row gutter={16}>
            {
                drawerData.metadata.map(metadataText => {
                    return <div><Tag>{metadataText.metadata_value}</Tag></div>
                })
            }
        </Row>
    ];

    const previewFile = async(filePath) =>{
        await api
            .preview(filePath)
            .then(
                response => fetchPreview(response)
            )
        console.log(filePath)
    }

    const downloadFile = async(filePath) =>{
        console.log(filePath)
        await api
            .download(filePath)
            .then(
                response => fetchDownload(response)
            )
    }

    const deleteFile = async(filePath) =>{
        api
            .delete(filePath)
            .then(
                response => fetchDownload(response)
            )
        console.log(filePath)
    }

    const fetchPreview = (response) =>{
        console.log(response.data)
        setImgSrc(URL.createObjectURL(response.data))
    }
    const fetchDownload = (response) =>{
        const href = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = href;
        console.log(response.data)
        link.setAttribute('download', 'file'); //or any other extension
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }
    return (
        <Space align="center" direction="vertical" size="large" style={{ display: 'flex' }}>
            <Card
                hoverable
                style={{ width: 140 }}
                cover={<FileOutlined style={{ paddingTop: '40px', fontSize: '50px', color: '#595959' }} />}
            >
            </Card>
            <Modal title="Show File" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Row gutter={16}>
                    <Col span={7}></Col>
                    <Col span={8}>
                        <Image
                            width={200}
                            src={imgSrc}
                        />
                    </Col>
                    <Col span={8}></Col>
                </Row>
            </Modal>
            <Row gutter={16}>
                <Col span={6}><Button onClick={downloadHandler} type="primary" icon={<DownloadOutlined />} /></Col>
                <Col span={6}><Button onClick={showModal} type="primary" icon={<EyeOutlined />} /></Col>
                <Col span={6}><Button type="primary" icon={<ShareAltOutlined />} /></Col>
                <Col span={6}>
                    <Popconfirm
                        title="Title"
                        description="Open Popconfirm with Promise"
                        onConfirm={confirm}
                        onOpenChange={() => console.log('open change')}
                    >
                        <Button type="primary" icon={<DeleteOutlined />} />
                    </Popconfirm>
                    </Col>
            </Row>
            <br />
            <Card
                style={{
                width: 300,
                }}
            >
                {kartuItem}
            </Card>
            <Collapse items={items} defaultActiveKey={['1']} ghost onChange={onChange} />
        </Space>
    )
}

export default DrawerContent;