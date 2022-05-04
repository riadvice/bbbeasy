import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
    title: string;
    image: string;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: 'One Line Installer',
        image: require('@site/static/img/bee_speed.png').default,
        description: (
            <>
                <strong>Hivelvet</strong> was designed from the ground up to be easily installed and
                used to get BigBlueButton rooms manager up and running quickly.
            </>
        ),
    },
    {
        title: 'Tailored for BigBlueButton',
        image: require('@site/static/img/bee_student.png').default,
        description: (
            <>
                Manage all your <strong>BigBlueButton</strong> conference rooms within a single web interface and
                configure
                all its features, branding included.
            </>
        ),
    },
    {
        title: 'Fully Open-Source',
        image: require('@site/static/img/bee_worker.png').default,
        description: (
            <>
                Extend or customize to your requirements. Or build a new integration using its <strong>API</strong>.
            </>
        ),
    },
];

function Feature({title, image, description}: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <img src={image} className={styles.featureImg} role="img"/>
            </div>
            <div className="text--center padding-horiz--md">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
