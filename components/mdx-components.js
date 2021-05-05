import Pre from './pre'

export const mdxComponents = {
  pre: ({children}) => {
    return <Pre {...children.props}></Pre>
  }
  //p: (props) => <p className="text-blue-900" {...props} />

}
