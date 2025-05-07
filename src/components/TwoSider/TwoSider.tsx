import { ReactNode } from 'react';
import { useDeskproAppTheme } from '@deskpro/app-sdk';
import TextBlockWithLabel, { ITextBlockWithLabel } from '../TextBlockWithLabel/TextBlockWithLabel';

interface Side {
    children: ReactNode;
};

const Side = ({ children }: Side) => (
    <div style={{display: 'inline-block', width: 'calc(49% - 6px)'}}>
        {children}
    </div>
);

interface TwoSider {
    leftLabel: ITextBlockWithLabel['label'];
    leftText: ITextBlockWithLabel['text'];
    rightLabel: ITextBlockWithLabel['label'];
    rightText: ITextBlockWithLabel['text'];
};

function TwoSider({ leftLabel, leftText, rightLabel, rightText }: TwoSider) {
    const { theme } = useDeskproAppTheme();

    return (
        <div style={{marginBottom: '-1px'}}>
            <Side>
                <TextBlockWithLabel
                    label={leftLabel}
                    text={leftText}
                />
            </Side>
            <div
                style={{
                    display: 'inline-block',
                    width: '1px',
                    height: '2em',
                    margin: '0 6px',
                    backgroundColor: theme.colors.grey20
                }}
            />
            <Side>
                <TextBlockWithLabel
                    label={rightLabel}
                    text={rightText}
                />
            </Side>
        </div>
    );
};

export default TwoSider;