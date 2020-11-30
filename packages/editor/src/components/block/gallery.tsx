import * as React from 'react';
import { img as ImgSvg, AddImage } from '../icons';
import { styled } from '@elliot/theme';

const ImagePlaceholder = styled('div', {
  backgroundColor: '#E6E8E9',
  borderRadius: 4,
  color: '#9B9FA4',
  fontSize: 16,
  lineHeight: '24px',
  padding: '16px 24px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  svg: {
    fontSize: 24,
    paddingRight: 8,
  },
});

export function GalleryBlock() {
  return (
    <>
      <ImagePlaceholder
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <AddImage />
        <span>Add an image</span>
      </ImagePlaceholder>
      <PanelSelection />
    </>
  );
}

type Panel = 'upload' | 'embed' | 'unsplash';

const PanelWrapper = styled('div', {
  background: '#FFFFFF',
  border: '1px solid #D3D6D8',
  boxSizing: 'border-box',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
  borderRadius: '0px 25px 25px 25px',
  margin: 24,
});

const TabTitleWrapper = styled('div', {
  display: 'flex',
  justifyContent: 'center',
});

const TabTitle = styled('div', {
  fontSize: 16,
  lineHeight: '24px',
  letterSpacing: '0.01em',
  color: '#242526',
  marginLeft: 24,
  paddingTop: 16,
  paddingLeft: 32,
  paddingRight: 32,
  paddingBottom: 24,
  '&:first-of-type': {
    marginLeft: 0,
  },
});

function PanelSelection() {
  const [activePanel, setActivePanel] = React.useState<Panel>(
    'upload',
  );
  return (
    <PanelWrapper>
      <TabTitleWrapper>
        <TabTitle>Upload</TabTitle>
        <TabTitle>Embed link</TabTitle>
        <TabTitle>Unsplash</TabTitle>
      </TabTitleWrapper>
    </PanelWrapper>
  );
}

GalleryBlock.block = {
  type: 'gallery',
  icon: {
    text: 'Gallery',
    svg: ImgSvg,
  },
  defaultValue: {
    files: [],
  },
};
